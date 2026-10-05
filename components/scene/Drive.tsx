// Drive mode: the visitor drives one car under PARADA's real rules. Zone A (the Main Loop) changes its count
// only at its gate cameras, main gate in and north gate out. Zones B and C exist only as numbers.
// Pull up at a camera: plate read → admission decided (registered, or guest under the policy) → on entry the
// count rises and a session opens; on exit the session closes, the count falls and a receipt prints.
// Arcade physics with two-circle collisions against the campus.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ZONES } from '@/lib/content';
import { sound } from '@/lib/sfx';
import { game, live, input, plateText, fmtDuration, useGame, admit } from '@/lib/game';
import {
  ZONE_A, TAKEN, BLOCKS, COURT, ROTONDA, ISLAND, TREES, PALMS, HOUSE_LIST, WALL_SEGMENTS, STREETS, POLE_RUNS,
  FORECOURT, CANOPY_PILLARS, CANOPY_PLANTERS, CANOPY_BOOTH, WALKWAY_POSTS, PAVILION_POSTS, GATE_LIST,
  GATE_STOP, PERGOLA_X, ROAD_W, SLOT_W, SLOT_D, WEST_ST, NORTH_ST, STREET_T, N, BOUNDS, nearestLoop, outsideSolids, type Gate, type GateId,
} from './layout';
import { gates, resetGates } from './state';
import { gateFrame } from './Gates';
import { PlayerCar } from './Pipeline';
import { plateTexture } from './signs';

const MAX_V = 15; // m/s ≈ 54 km/h
const MAX_REV = 5;
const OFFROAD_V = 5;
const START = { x: WEST_ST + 1.7, z: 34, h: N };
const CAR_R = 1.05; // two circles, ±1.15 m along the car
const CAR_OFF = 1.15;
const BOOM_Z: Record<Gate['style'], number> = { canopy: -1.2, pergola: 1.2 };

type Box = { x0: number; x1: number; z0: number; z1: number };
type Circle = { x: number; z: number; r: number };
type Seg = { ax: number; az: number; bx: number; bz: number };
const box = (x: number, z: number, hw: number, hd: number): Box => ({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd });
const inBox = (b: Box, x: number, z: number) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;

const FRAMES = Object.fromEntries(GATE_LIST.map((g) => [g.id, gateFrame(g)])) as Record<GateId, ReturnType<typeof gateFrame>>;
const toLocal = (g: Gate, x: number, z: number) => {
  const c = Math.cos(g.inward);
  const s = Math.sin(g.inward);
  const dx = x - g.x;
  const dz = z - g.z;
  return [dx * c - dz * s, dx * s + dz * c] as const;
};
const boomSeg = (g: Gate): Seg => {
  const a = FRAMES[g.id].at(-ROAD_W / 2 - 0.2, 0, BOOM_Z[g.style]);
  const b = FRAMES[g.id].at(ROAD_W / 2 + 0.3, 0, BOOM_Z[g.style]);
  return { ax: a.x, az: a.z, bx: b.x, bz: b.z };
};
const BOOMS = Object.fromEntries(GATE_LIST.map((g) => [g.id, boomSeg(g)])) as Record<GateId, Seg>;

// Static obstacles, built once from the layout.
const solid = (() => {
  const boxes: Box[] = [];
  const circles: Circle[] = [];
  const segs: Seg[] = WALL_SEGMENTS.map(([ax, az, bx, bz]) => ({ ax, az, bx, bz }));
  // building footprints: every facade edge is a wall
  // the covered court has no walls: its columns and bleachers are what you can hit
  for (const [x, z] of COURT.columns) circles.push({ x, z, r: 0.5 });
  for (const [x0, x1, z0, z1] of COURT.bleachers) boxes.push({ x0, x1, z0, z1 });
  for (const b of BLOCKS) if (b.roof !== 'court') b.pts.forEach(([ax, az], i) => {
    const [bx, bz] = b.pts[(i + 1) % b.pts.length];
    segs.push({ ax, az, bx, bz });
  });
  boxes.push({ x0: ISLAND[0], x1: ISLAND[1], z0: ISLAND[2], z1: ISLAND[3] });
  circles.push({ x: ROTONDA.x, z: ROTONDA.z, r: ROTONDA.r });
  // houses as their footprint's inscribed circle (good enough at driving speed)
  for (const h of HOUSE_LIST) circles.push({ x: h.x, z: h.z, r: Math.min(h.w, h.d) / 2 });
  ZONE_A.slots.forEach((s, i) => {
    if (TAKEN.has(i)) boxes.push(box(s.x, s.z, 2.1, 0.95));
  });
  for (const [x, z, s] of TREES) circles.push({ x, z, r: Math.max(0.35, s * 0.035) });
  for (const [x, z] of PALMS) circles.push({ x, z, r: 0.45 });
  for (const run of POLE_RUNS) for (const [x, z] of run) circles.push({ x, z, r: 0.3 });
  for (const [x, z] of WALKWAY_POSTS) circles.push({ x, z, r: 0.18 });
  for (const [x, z] of PAVILION_POSTS) circles.push({ x, z, r: 0.25 });
  for (const p of CANOPY_PILLARS) circles.push({ x: p.x, z: p.z, r: 1.15 });
  for (const p of CANOPY_PLANTERS) circles.push({ x: p.x, z: p.z, r: 1.0 });
  circles.push({ x: CANOPY_BOOTH.x, z: CANOPY_BOOTH.z, r: 1.9 });
  for (const g of GATE_LIST) {
    const at = FRAMES[g.id].at;
    const pts: [number, number, number][] =
      g.style === 'canopy' ? [[ROAD_W / 2 + 0.3, -1.2, 0.35]]
      : [[-PERGOLA_X, -3.5, 0.3], [PERGOLA_X, -3.5, 0.3], [-PERGOLA_X, 3.5, 0.3], [PERGOLA_X, 3.5, 0.3], [ROAD_W / 2 + 0.3, 1.2, 0.35]];
    for (const [lx, lz, r] of pts) {
      const p = at(lx, 0, lz);
      circles.push({ x: p.x, z: p.z, r });
    }
  }
  return { boxes, circles, segs };
})();

// Paved surfaces (full speed); everything else is lawn (slow).
const paved: Box[] = [
  ...STREETS.map(([x, z, w, d]) => box(x, z, w / 2 + 0.5, d / 2 + 0.5)),
  ...ZONE_A.rows.map((r) => box(r.x0, r.z0 + (r.count * SLOT_W) / 2, SLOT_D / 2 + 0.2, (r.count * SLOT_W) / 2)),
];
const onPavement = (x: number, z: number) =>
  paved.some((b) => inBox(b, x, z)) ||
  nearestLoop(x, z).d < ROAD_W / 2 + 0.6 ||
  (Math.hypot(x - FORECOURT.x, z - FORECOURT.z) < FORECOURT.r && x > WEST_ST && z > NORTH_ST - STREET_T / 2);

// Push a circle out of every obstacle; returns true on contact.
const push = (c: { x: number; z: number }, nx: number, nz: number, r: number) => {
  const dx = c.x - nx;
  const dz = c.z - nz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return false;
  if (d2 > 1e-8) {
    const d = Math.sqrt(d2);
    c.x += (dx / d) * (r - d);
    c.z += (dz / d) * (r - d);
  }
  return true;
};
const onSeg = (s: Seg, x: number, z: number): [number, number] => {
  const vx = s.bx - s.ax;
  const vz = s.bz - s.az;
  const t = Math.max(0, Math.min(1, ((x - s.ax) * vx + (z - s.az) * vz) / (vx * vx + vz * vz || 1)));
  return [s.ax + vx * t, s.az + vz * t];
};
const resolve = (c: { x: number; z: number }, extra: Seg[]) => {
  let hit = false;
  for (const b of solid.boxes) {
    if (c.x < b.x0 - CAR_R || c.x > b.x1 + CAR_R || c.z < b.z0 - CAR_R || c.z > b.z1 + CAR_R) continue;
    const nx = Math.max(b.x0, Math.min(c.x, b.x1));
    const nz = Math.max(b.z0, Math.min(c.z, b.z1));
    if (nx === c.x && nz === c.z) {
      // centre inside the box: leave by the nearest face
      const out = [c.x - b.x0, b.x1 - c.x, c.z - b.z0, b.z1 - c.z];
      const k = out.indexOf(Math.min(...out));
      if (k === 0) c.x = b.x0 - CAR_R;
      else if (k === 1) c.x = b.x1 + CAR_R;
      else if (k === 2) c.z = b.z0 - CAR_R;
      else c.z = b.z1 + CAR_R;
      hit = true;
    } else hit = push(c, nx, nz, CAR_R) || hit;
  }
  for (const o of solid.circles) if (Math.abs(c.x - o.x) < CAR_R + o.r && Math.abs(c.z - o.z) < CAR_R + o.r) hit = push(c, o.x, o.z, CAR_R + o.r) || hit;
  for (const s of solid.segs.concat(extra)) {
    if (c.x < Math.min(s.ax, s.bx) - 2 || c.x > Math.max(s.ax, s.bx) + 2 || c.z < Math.min(s.az, s.bz) - 2 || c.z > Math.max(s.az, s.bz) + 2) continue;
    const [nx, nz] = onSeg(s, c.x, c.z);
    hit = push(c, nx, nz, CAR_R + 0.15) || hit;
  }
  return hit;
};

const tmp = new THREE.Vector3();
const approach = (v: number, target: number, rate: number) => (v < target ? Math.min(target, v + rate) : Math.max(target, v - rate));
const zoneName = (z: number) => ZONES[z].name;

export default function Drive({ reduced }: { reduced: boolean }) {
  const { driving, plate, run } = useGame();
  const camera = useThree((s) => s.camera);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const tex = useMemo(() => plateTexture(plateText(plate)), [plate]);
  useEffect(() => () => tex.dispose(), [tex]);

  const car = useRef<THREE.Group>(null!);
  const st = useRef({ x: START.x, z: START.z, h: START.h, v: 0, steer: 0, bump: 0 });
  const fresh = () => ({
    scan: null as null | { gate: Gate; dir: 'in' | 'out'; t0: number; stage: number },
    armed: { main: true, north: true } as Record<GateId, boolean>,
    open: { main: false, north: false } as Record<GateId, boolean>,
    deniedAt: null as GateId | null,
    rule: '',
    warnAt: 0,
  });
  const trip = useRef(fresh());

  useEffect(() => {
    if (!driving) {
      sound.engine(0);
      return;
    }
    setFrameloop('always');
    st.current = { x: START.x, z: START.z, h: START.h, v: 0, steer: 0, bump: 0 };
    trip.current = fresh();
    resetGates();
    Object.assign(live, { speed: 0, elapsed: 0 });
    const f = new THREE.Vector3(Math.sin(START.h), 0, Math.cos(START.h));
    camera.position.set(START.x - f.x * 10, 5, START.z - f.z * 10);
    camera.lookAt(START.x, 1, START.z);
  }, [driving, run, camera, setFrameloop]);

  const look = useRef(new THREE.Vector3());
  useFrame((state, rawDt) => {
    car.current.visible = driving;
    if (!driving) return;
    const dt = Math.min(rawDt, 0.1);
    const s = st.current;
    const tr = trip.current;
    const g = game.get();
    const now = state.clock.elapsedTime;
    const el = document.getElementById('stage-dim');
    if (el) el.style.opacity = '0';

    // --- physics ---
    const onRoad = onPavement(s.x, s.z);
    const top = onRoad ? MAX_V : OFFROAD_V;
    if (input.brake) s.v = approach(s.v, 0, 22 * dt);
    else if (input.up) s.v = s.v < 0 ? approach(s.v, 0, 14 * dt) : Math.min(top, s.v + 7.5 * dt);
    else if (input.down) s.v = s.v > 0 ? approach(s.v, 0, 14 * dt) : Math.max(-MAX_REV, s.v - 5 * dt);
    else s.v = approach(s.v, 0, 3.2 * dt);
    if (s.v > top) s.v = approach(s.v, top, 12 * dt);
    const want = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    s.steer = approach(s.steer, want, 5 * dt);
    const grip = Math.min(1, Math.abs(s.v) / 5);
    s.h += s.steer * grip * Math.sign(s.v) * 1.9 * dt * (1 - Math.min(0.45, (Math.abs(s.v) / MAX_V) * 0.45));

    const extra = GATE_LIST.filter((gt) => gates[gt.id].boom < 0.6).map((gt) => BOOMS[gt.id]);
    // substeps keep a fast car from tunnelling through thin walls on slow frames
    const n = Math.ceil(dt * 60);
    for (let i = 0; i < n; i++) {
      s.x += (Math.sin(s.h) * s.v * dt) / n;
      s.z += (Math.cos(s.h) * s.v * dt) / n;
      const fx = Math.sin(s.h) * CAR_OFF;
      const fz = Math.cos(s.h) * CAR_OFF;
      const front = { x: s.x + fx, z: s.z + fz };
      const back = { x: s.x - fx, z: s.z - fz };
      const hitF = resolve(front, extra);
      const hitB = resolve(back, extra);
      if (!hitF && !hitB) continue;
      s.x = (front.x + back.x) / 2;
      s.z = (front.z + back.z) / 2;
      if (Math.abs(s.v) > 3 && now - s.bump > 0.5) {
        sound.play('tick');
        s.bump = now;
      }
      s.v *= -0.15;
    }
    s.x = THREE.MathUtils.clamp(s.x, BOUNDS.x0, BOUNDS.x1);
    s.z = THREE.MathUtils.clamp(s.z, BOUNDS.z0, BOUNDS.z1);

    car.current.position.set(s.x, 0, s.z);
    car.current.rotation.y = s.h;
    live.speed = Math.abs(s.v) * 3.6;
    sound.engine(0.15 + (Math.abs(s.v) / MAX_V) * 0.85);

    // --- chase camera; portrait screens sit further back, higher, aiming further down the road ---
    const pull = Math.min(2, Math.max(1, Math.sqrt(1.6 / (state.size.width / state.size.height))));
    const back = (reduced ? 11 : 9) * pull;
    const k = 1 - Math.exp(-(reduced ? 8 : 4.5) * dt);
    camera.position.lerp(tmp.set(s.x - Math.sin(s.h) * back, 4.6 * pull, s.z - Math.cos(s.h) * back), k);
    const ahead = 4 + (pull - 1) * 9;
    look.current.lerp(tmp.set(s.x + Math.sin(s.h) * ahead, 1.2, s.z + Math.cos(s.h) * ahead), k);
    // backing up against a building would put the chase camera inside it: step it out toward the car
    const clear = outsideSolids(look.current, camera.position);
    if (clear < 1) camera.position.lerpVectors(look.current, camera.position, clear);
    camera.lookAt(look.current);

    const slow = Math.abs(s.v) < 1.5;

    // --- gate cameras ---
    // switching plate or policy after a refusal lets the same camera read the car again
    if (tr.rule !== g.plate + g.policy) {
      tr.rule = g.plate + g.policy;
      if (tr.deniedAt) {
        tr.armed[tr.deniedAt] = true;
        tr.deniedAt = null;
        game.set({ denied: null });
      }
    }
    for (const gt of GATE_LIST) {
      const [lx, lz] = toLocal(gt, s.x, s.z);
      const lane = Math.abs(lx) < ROAD_W / 2 + 0.8;
      const facing = Math.cos(s.h - gt.inward); // +1 driving in, -1 driving out
      const outside = lane && lz > -GATE_STOP - 4 && lz < -1.6;
      const inside = lane && lz > 1.6 && lz < GATE_STOP + 4;
      const far = !lane || Math.abs(lz) > GATE_STOP + 6;
      if (far) {
        tr.armed[gt.id] = true;
        tr.open[gt.id] = false;
        if (tr.deniedAt === gt.id) {
          tr.deniedAt = null;
          game.set({ denied: null });
        }
      }
      gates[gt.id].boom = approach(gates[gt.id].boom, tr.open[gt.id] ? 1 : 0, dt * 2.5);
      if (!tr.armed[gt.id] || tr.scan || !slow) continue;
      if (outside && facing > 0.6) {
        tr.armed[gt.id] = false;
        if (gt.kind === 'exit') {
          sound.play('deny');
          game.set({ toast: { title: 'Exit only', body: `This camera only reads cars leaving ${zoneName(gt.zone)}. Its entry camera is the main gate on Tolentino Rd.`, tone: 'warn' } });
        } else tr.scan = { gate: gt, dir: 'in', t0: now, stage: 0 };
      } else if (inside && facing < -0.6) {
        tr.armed[gt.id] = false;
        if (gt.kind === 'entry') {
          sound.play('deny');
          game.set({ toast: { title: 'Entry only', body: `Leave ${zoneName(gt.zone)} through the north gate on Doña Aurelia St.`, tone: 'warn' } });
        } else tr.scan = { gate: gt, dir: 'out', t0: now, stage: 0 };
      }
    }

    // --- one scan at a time: camera → OCR → decision ---
    const sc = tr.scan;
    for (const gt of GATE_LIST) {
      const mine = sc?.gate === gt;
      const t = mine ? now - sc!.t0 : 99;
      const glow = mine ? Math.min(1, t * 3) * (t < 1.7 ? 1 : Math.max(0, 1 - (t - 1.7) * 3)) : 0;
      gates[gt.id].cone = approach(gates[gt.id].cone, mine && sc!.dir === 'in' ? glow : 0, dt * 4);
      gates[gt.id].coneOut = approach(gates[gt.id].coneOut, mine && sc!.dir === 'out' ? glow : 0, dt * 4);
    }
    if (sc) {
      const t = now - sc.t0;
      const zone = sc.gate.zone;
      const name = zoneName(zone);
      const p = plateText(g.plate);
      if (sc.stage === 0) {
        sc.stage = 1;
        sound.play('scan');
        game.set({ toast: { title: `Gate camera · ${sc.gate.cam}`, body: sc.dir === 'in' ? 'Reading the plate of a car entering…' : 'Reading the plate of a car leaving…', tone: 'info' } });
      }
      if (sc.stage === 1 && t > 0.8) {
        sc.stage = 2;
        sound.play('ocr');
        game.set({ toast: { title: `OCR · ${p}`, body: `${sc.dir === 'in' ? 'ENTRY' : 'EXIT'} event sent to the PARADA API.`, tone: 'info' } });
      }
      if (sc.stage === 2 && t > 1.6) {
        sc.stage = 3;
        if (sc.dir === 'in') {
          const d = admit(g.plate, g.policy, zone, g.counts[zone], ZONES[zone].capacity);
          if (d.ok) {
            const n = g.counts[zone] + 1;
            tr.open[sc.gate.id] = true;
            sound.play('decide');
            game.setCount(zone, n);
            game.set({
              session: { zone, start: performance.now(), camera: sc.gate.cam },
              receipt: null,
              denied: null,
              toast: g.plate === 'registered'
                ? { title: `Registered vehicle · ${name} ${n}/${ZONES[zone].capacity}`, body: 'Matched to a registered user. Occupancy and the session updated in one transaction.', tone: 'ok' }
                : { title: `Guest admitted · ${name} ${n}/${ZONES[zone].capacity}`, body: 'No registered match; the guest policy admits this zone. A guest session opened.', tone: 'warn' },
            });
          } else {
            sound.play('deny');
            tr.deniedAt = sc.gate.id;
            const why = d.reason === 'full'
              ? `${name} is full, so the camera's ENTRY is refused.`
              : `Guest candidate turned away: under this policy guests may only use Zone C, the primary guest zone. Switch the policy to "Any zone with space" to come in here.`;
            game.set({ denied: why, toast: { title: d.reason === 'full' ? `${name} is full` : 'Guest candidate · denied', body: 'Occupancy unchanged; recorded for the admin as a guest-admission issue.', tone: 'bad' } });
          }
        } else {
          tr.open[sc.gate.id] = true;
          const open = g.session;
          if (open && open.zone === zone) {
            const secs = (performance.now() - open.start) / 1000;
            sound.play('print');
            game.setCount(zone, g.counts[zone] - 1);
            game.set({
              session: null,
              receipt: { plate: p, zone: `${ZONES[zone].code} — ${ZONES[zone].area}`, duration: fmtDuration(secs), rate: 'Configured', fee: 'Calculated', camera: sc.gate.cam },
              toast: { title: `Session closed · ${name} ${g.counts[zone] - 1}/${ZONES[zone].capacity}`, body: 'Duration recorded and the fee calculated where configured.', tone: 'ok' },
            });
          } else {
            sound.play('tick');
            game.set({ toast: { title: 'No open session here', body: `EXIT with no session in ${name}: recorded as an anomaly, count unchanged.`, tone: 'warn' } });
          }
        }
      }
      if (t > 2.4) tr.scan = null;
    }

    // session timer
    live.elapsed = g.session ? (performance.now() - g.session.start) / 1000 : 0;

    // --- Zone A's loop runs one way ---
    if (Math.abs(s.v) > 3 && now - tr.warnAt > 4) {
      const vx = Math.sin(s.h) * s.v;
      const vz = Math.cos(s.h) * s.v;
      const lp = nearestLoop(s.x, s.z);
      if (lp.d < ROAD_W / 2 && lp.u > 0.02 && vx * lp.tx + vz * lp.tz < -2.5) {
        tr.warnAt = now;
        sound.play('deny');
        game.set({ toast: { title: 'One way', body: 'The Main Loop runs one way: down the tree avenue, past the rotonda, up to the north gate.', tone: 'warn' } });
      }
    }
  });

  return (
    <group ref={car} visible={false}>
      <Suspense fallback={null}>
        <PlayerCar plate={tex} />
      </Suspense>
    </group>
  );
}
