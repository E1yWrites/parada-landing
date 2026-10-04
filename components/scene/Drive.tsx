// Drive mode: the visitor drives the car through the real flow. Arcade physics, two-circle collisions
// against the campus, and the PARADA steps as triggers: ENTRY camera → OCR → policy → boom,
// park in a free slot (zone count +1), EXIT camera → session closed → receipt.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ZONES } from '@/lib/content';
import { sound } from '@/lib/sfx';
import { game, live, input, plateText, fmtDuration, useGame } from '@/lib/game';
import {
  zoneLayout, TAKEN, ROADS, BUILDINGS, TOWER, PROPS, PALMS, BOUNDS, ENTRY, EXIT, GATE_GAP, WEST_X, EAST_X, BASE_Z,
  WALL_Z, STREET_Z, ROAD_W, SLOT_W, SLOT_D,
} from './layout';
import { gates } from './state';
import { PlayerCar } from './Pipeline';
import { plateTexture } from './signs';

const MAX_V = 15; // m/s ≈ 54 km/h
const MAX_REV = 5;
const OFFROAD_V = 5;
const START = { x: -92, z: STREET_Z + 1.6, h: Math.PI / 2 };
const CAR_R = 1.05; // two circles, ±1.15 m along the car
const CAR_OFF = 1.15;

type Box = { x0: number; x1: number; z0: number; z1: number };
type Circle = { x: number; z: number; r: number };
const box = (x: number, z: number, hw: number, hd: number): Box => ({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd });
const inBox = (b: Box, x: number, z: number) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;

// Static obstacles, built once from the layout.
const solid = (() => {
  const boxes: Box[] = [];
  const circles: Circle[] = [];
  for (const b of Object.values(BUILDINGS)) boxes.push(box(b.x, b.z, b.w / 2, b.d / 2));
  circles.push({ x: TOWER.x, z: TOWER.z, r: TOWER.r });
  // campus wall, open only at the two gates
  const t = 0.6;
  boxes.push({ x0: BOUNDS.x0, x1: ENTRY.x - 5.4, z0: WALL_Z - t, z1: WALL_Z + t });
  boxes.push({ x0: ENTRY.x + GATE_GAP, x1: EXIT.x - GATE_GAP, z0: WALL_Z - t, z1: WALL_Z + t });
  boxes.push({ x0: EXIT.x + GATE_GAP, x1: BOUNDS.x1, z0: WALL_Z - t, z1: WALL_Z + t });
  boxes.push({ x0: BOUNDS.x0, x1: BOUNDS.x1, z0: BOUNDS.z0 - t, z1: BOUNDS.z0 + t });
  boxes.push({ x0: BOUNDS.x0 - t, x1: BOUNDS.x0 + t, z0: BOUNDS.z0, z1: WALL_Z });
  boxes.push({ x0: BOUNDS.x1 - t, x1: BOUNDS.x1 + t, z0: BOUNDS.z0, z1: WALL_Z });
  // gate furniture: entry pillars + guard booth, exit posts
  for (const dx of [-5.4, 5.4]) boxes.push(box(ENTRY.x + dx, WALL_Z, 0.85, 0.95));
  boxes.push(box(ENTRY.x - 9.2, WALL_Z + 2.4, 1.5, 1.4));
  for (const dx of [-5, 5]) for (const dz of [-3.5, 3.5]) circles.push({ x: EXIT.x + dx, z: WALL_Z + dz, r: 0.3 });
  // parked cars
  zoneLayout.forEach((z, zi) =>
    z.slots.forEach((s, i) => {
      if (!TAKEN[zi].has(i)) return;
      const along = Math.abs(Math.sin(s.rot)) > 0.5;
      boxes.push(box(s.x, s.z, along ? 2.1 : 0.95, along ? 0.95 : 2.1));
    }),
  );
  // carport posts behind Zone B's north row
  const r = zoneLayout[1].rows[0];
  for (let k = 0; k < 9; k++) circles.push({ x: r.x0 + (k * r.count * SLOT_W) / 8, z: r.z0 - SLOT_D / 2 - 0.3, r: 0.25 });
  // Kenney props: tree clusters, lamp posts, fountain, shophouses
  for (const [m, x, z, s, h] of PROPS) {
    if (m.startsWith('grass-trees')) circles.push({ x, z, r: s * 0.3 });
    else if (m === 'pavement-fountain') circles.push({ x, z, r: s * 0.4 });
    else if (m === 'road-straight-lightposts') for (const d of [-0.42, 0.42]) circles.push({ x: x + Math.cos(h) * d * s, z: z - Math.sin(h) * d * s, r: 0.3 });
    else boxes.push(box(x, z, s * 0.48, s * 0.48));
  }
  for (const [x, z] of PALMS) circles.push({ x, z, r: 0.45 });
  return { boxes, circles };
})();

// Paved surfaces (full speed); everything else is lawn (slow).
const paved: Box[] = [
  ...ROADS.map(([x, z, w, d]) => box(x, z, w / 2, d / 2)),
  ...zoneLayout.flatMap((z) => [z.box]),
  box(0, WALL_Z + 2, 160, 2.2), // sidewalk along the wall
];

// Gate trigger areas
const ENTRY_PAD = box(ENTRY.x, WALL_Z + 4.5, 4.5, 3.5);
const EXIT_PAD = box(EXIT.x, WALL_Z - 5, 4.5, 3.5);
const ENTRY_BOOM: Box = { x0: ENTRY.x - 5, x1: ENTRY.x + 4.5, z0: WALL_Z + 0.8, z1: WALL_Z + 1.6 };
const EXIT_SLIDE: Box = { x0: EXIT.x - GATE_GAP, x1: EXIT.x + GATE_GAP, z0: WALL_Z + 0.3, z1: WALL_Z + 0.9 };
const LEGS = { west: box(WEST_X, 0, ROAD_W / 2, 50), east: box(EAST_X, 0, ROAD_W / 2, 50), base: box(0, BASE_Z, EAST_X, ROAD_W / 2) };

const zoneAt = (x: number, z: number) => zoneLayout.findIndex((zl) => inBox(zl.box, x, z));

// Push a circle out of every obstacle; returns true on contact.
const resolve = (c: { x: number; z: number }, extra: Box[]) => {
  let hit = false;
  for (const b of [...solid.boxes, ...extra]) {
    const nx = Math.max(b.x0, Math.min(c.x, b.x1));
    const nz = Math.max(b.z0, Math.min(c.z, b.z1));
    const dx = c.x - nx;
    const dz = c.z - nz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= CAR_R * CAR_R) continue;
    hit = true;
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2);
      c.x += (dx / d) * (CAR_R - d);
      c.z += (dz / d) * (CAR_R - d);
    } else {
      // centre inside the box: leave by the nearest face
      const out = [c.x - b.x0, b.x1 - c.x, c.z - b.z0, b.z1 - c.z];
      const k = out.indexOf(Math.min(...out));
      if (k === 0) c.x = b.x0 - CAR_R;
      else if (k === 1) c.x = b.x1 + CAR_R;
      else if (k === 2) c.z = b.z0 - CAR_R;
      else c.z = b.z1 + CAR_R;
    }
  }
  for (const o of solid.circles) {
    const dx = c.x - o.x;
    const dz = c.z - o.z;
    const r = CAR_R + o.r;
    const d2 = dx * dx + dz * dz;
    if (d2 >= r * r || d2 < 1e-8) continue;
    const d = Math.sqrt(d2);
    c.x += (dx / d) * (r - d);
    c.z += (dz / d) * (r - d);
    hit = true;
  }
  return hit;
};

const tmp = new THREE.Vector3();
const approach = (v: number, target: number, rate: number) => (v < target ? Math.min(target, v + rate) : Math.max(target, v - rate));

export default function Drive({ reduced }: { reduced: boolean }) {
  const { driving, plate, run } = useGame();
  const camera = useThree((s) => s.camera);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const tex = useMemo(() => plateTexture(plateText(plate)), [plate]);
  useEffect(() => () => tex.dispose(), [tex]);

  const car = useRef<THREE.Group>(null!);
  const st = useRef({ x: START.x, z: START.z, h: START.h, v: 0, steer: 0, bump: 0 });
  // trip state machine timers
  const trip = useRef({ scanAt: 0, stage: 0, admitted: false, denied: false, inside: false, slot: -1, slotZone: -1, still: 0, parked: false, exitAt: 0, closed: false, warnAt: 0 });

  useEffect(() => {
    if (!driving) {
      sound.engine(0);
      return;
    }
    setFrameloop('always');
    st.current = { x: START.x, z: START.z, h: START.h, v: 0, steer: 0, bump: 0 };
    trip.current = { scanAt: 0, stage: 0, admitted: false, denied: false, inside: false, slot: -1, slotZone: -1, still: 0, parked: false, exitAt: 0, closed: false, warnAt: 0 };
    Object.assign(gates, { entryBoom: 0, entryCone: 0, exitSlide: 0, exitCone: 0 });
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
    const onRoad = paved.some((b) => inBox(b, s.x, s.z));
    const top = onRoad ? MAX_V : OFFROAD_V;
    if (input.brake) s.v = approach(s.v, 0, 22 * dt);
    else if (input.up) s.v = s.v < 0 ? approach(s.v, 0, 14 * dt) : Math.min(top, s.v + 7.5 * dt);
    else if (input.down) s.v = s.v > 0 ? approach(s.v, 0, 14 * dt) : Math.max(-MAX_REV, s.v - 5 * dt);
    else s.v = approach(s.v, 0, 3.2 * dt);
    if (s.v > top) s.v = approach(s.v, top, 12 * dt);
    const want = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    s.steer = approach(s.steer, want, 5 * dt);
    const grip = Math.min(1, Math.abs(s.v) / 5);
    s.h += s.steer * grip * Math.sign(s.v) * 1.9 * dt * (1 - Math.min(0.45, Math.abs(s.v) / MAX_V * 0.45));
    const extra: Box[] = [];
    if (gates.entryBoom < 0.6) extra.push(ENTRY_BOOM);
    if (gates.exitSlide < 0.8) extra.push(EXIT_SLIDE);
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
    s.x = THREE.MathUtils.clamp(s.x, -165, 165);
    s.z = THREE.MathUtils.clamp(s.z, -100, 78);

    car.current.position.set(s.x, 0, s.z);
    car.current.rotation.y = s.h;
    live.speed = Math.abs(s.v) * 3.6;
    sound.engine(0.15 + (Math.abs(s.v) / MAX_V) * 0.85);

    // --- chase camera ---
    // portrait screens see a narrow slice: sit further back and higher
    const pull = Math.min(2, Math.max(1, Math.sqrt(1.6 / (state.size.width / state.size.height))));
    const back = (reduced ? 11 : 9) * pull;
    const camX = s.x - Math.sin(s.h) * back;
    const camZ = s.z - Math.cos(s.h) * back;
    const k = 1 - Math.exp(-(reduced ? 8 : 4.5) * dt);
    camera.position.lerp(tmp.set(camX, 4.6 * pull, camZ), k);
    const ahead = 4 + (pull - 1) * 9; // portrait: aim further down the road so it shows above the car
    look.current.lerp(tmp.set(s.x + Math.sin(s.h) * ahead, 1.2, s.z + Math.cos(s.h) * ahead), k);
    camera.lookAt(look.current);

    const slow = Math.abs(s.v) < 1.5;

    // --- ENTRY: camera → OCR → policy → boom ---
    if (!tr.admitted) {
      const atGate = inBox(ENTRY_PAD, s.x, s.z);
      if (atGate && slow && !tr.scanAt && !tr.denied) {
        tr.scanAt = now;
        tr.stage = 0;
        sound.play('scan');
        game.set({ toast: { title: 'Gate camera', body: 'Capturing the licence plate…', tone: 'info' } });
      }
      if (tr.scanAt) {
        const t = now - tr.scanAt;
        gates.entryCone = Math.min(1, t * 3) * (t < 1.6 ? 1 : Math.max(0, 1 - (t - 1.6) * 4));
        if (t > 0.8 && tr.stage < 1) {
          tr.stage = 1;
          sound.play('ocr');
          game.set({ toast: { title: `OCR · ${plateText(g.plate)}`, body: 'Plate read. Sending to the PARADA API.', tone: 'info' } });
        }
        if (t > 1.6 && tr.stage < 2) {
          tr.stage = 2;
          if (g.plate === 'registered') {
            tr.admitted = true;
            sound.play('decide');
            game.set({ sessionStart: performance.now(), toast: { title: 'Registered vehicle', body: 'Plate matched to a registered user. Session opened. Gate open.', tone: 'ok' } });
          } else if (g.policy === 'admit') {
            tr.admitted = true;
            sound.play('decide');
            game.set({ sessionStart: performance.now(), toast: { title: 'Guest candidate · admitted', body: 'No registered match. The guest policy admits this vehicle.', tone: 'warn' } });
          } else {
            tr.denied = true;
            tr.scanAt = 0;
            sound.play('deny');
            game.set({ denied: true, toast: { title: 'Guest candidate · denied', body: 'No registered match and the guest policy denies entry. Switch the policy, then pull up again.', tone: 'bad' } });
          }
        }
      }
      // denied: re-arm once the car backs off the pad, or the policy / plate changes
      if (tr.denied && (!atGate || g.policy === 'admit' || g.plate === 'registered')) {
        tr.denied = false;
        game.set({ denied: false });
      }
    } else {
      if (tr.scanAt) gates.entryCone = Math.max(0, gates.entryCone - dt * 3);
      const inside = s.z < WALL_Z - 3;
      if (inside && !tr.inside) {
        tr.inside = true;
        game.set({ step: 'park', toast: { title: 'Find a free slot', body: 'Park in any free slot in Zone A, B or C. Stop inside the lines.', tone: 'info' } });
      }
      gates.entryBoom = approach(gates.entryBoom, tr.inside && s.z < WALL_Z - 6 ? 0 : 1, dt * 2.5);
    }

    // --- parking: stop inside a free slot for a moment ---
    if (tr.inside && !tr.exitAt) {
      const zi = zoneAt(s.x, s.z);
      let slot = -1;
      if (zi >= 0 && slow) {
        slot = zoneLayout[zi].slots.findIndex(
          (sl, i) => !TAKEN[zi].has(i) && Math.hypot(sl.x - s.x, sl.z - s.z) < 1.4 && Math.abs(Math.cos(sl.rot - s.h)) > 0.8,
        );
      }
      if (!tr.parked) {
        tr.still = slot >= 0 && Math.abs(s.v) < 0.4 ? tr.still + dt : 0;
        if (tr.still > 1.1) {
          tr.parked = true;
          tr.slot = slot;
          tr.slotZone = zi;
          const n = g.counts[zi] + 1;
          game.setCount(zi, n);
          game.set({ parkedZone: zi, toast: { title: `Parked in ${ZONES[zi].name}`, body: `Zone occupancy ${n} / ${ZONES[zi].capacity}. Head round the loop to EXIT when you're done.`, tone: 'ok' } });
          sound.play('chime');
        }
      } else {
        const sl = zoneLayout[tr.slotZone].slots[tr.slot];
        if (Math.hypot(sl.x - s.x, sl.z - s.z) > 3) {
          tr.parked = false;
          game.setCount(tr.slotZone, game.get().counts[tr.slotZone] - 1);
          game.set({ toast: { title: `Left ${ZONES[tr.slotZone].name}`, body: 'Slot released. Park again, or follow the arrows to EXIT.', tone: 'info' } });
          sound.play('tick');
        }
      }
    }

    // --- EXIT: camera → session closed → slide gate ---
    if (tr.inside && !tr.closed) {
      if (!tr.exitAt && inBox(EXIT_PAD, s.x, s.z) && slow && !tr.parked) {
        tr.exitAt = now;
        sound.play('scan');
        game.set({ step: 'exit', toast: { title: 'Exit camera', body: 'Reading the plate to close the session…', tone: 'info' } });
      }
      if (tr.exitAt) {
        const t = now - tr.exitAt;
        gates.exitCone = Math.min(1, t * 3) * Math.max(0, 1 - Math.max(0, t - 1.4) * 4);
        if (t > 1.4 && !tr.closed) {
          tr.closed = true;
          const secs = g.sessionStart ? (performance.now() - g.sessionStart) / 1000 : 0;
          const pz = g.parkedZone;
          sound.play('print');
          game.set({
            receipt: { plate: plateText(g.plate), zone: pz == null ? 'Not parked' : `${ZONES[pz].code} — ${ZONES[pz].area}`, duration: fmtDuration(secs), rate: 'Configured', fee: 'Calculated' },
            toast: { title: 'Session closed', body: 'Fee calculated where configured. Gate open — drive out.', tone: 'ok' },
          });
        }
      }
    }
    if (tr.closed) {
      gates.exitCone = Math.max(0, gates.exitCone - dt * 3);
      const out = s.z > WALL_Z + 4;
      gates.exitSlide = approach(gates.exitSlide, out ? 0 : 1, dt * 1.5);
      if (out && g.step !== 'done') {
        game.set({ step: 'done', toast: null });
        sound.play('chime');
      }
    }
    // session timer
    live.elapsed = g.sessionStart && !tr.closed ? (performance.now() - g.sessionStart) / 1000 : live.elapsed;

    // --- one-way loop + exit-only hints ---
    if (Math.abs(s.v) > 3 && now - tr.warnAt > 4) {
      const vx = Math.sin(s.h) * s.v;
      const vz = Math.cos(s.h) * s.v;
      const wrong =
        (inBox(LEGS.west, s.x, s.z) && s.z < WALL_Z && vz > 2.5) ||
        (inBox(LEGS.east, s.x, s.z) && s.z < WALL_Z - 2 && vz < -2.5) ||
        (inBox(LEGS.base, s.x, s.z) && vx < -2.5);
      const exitOnly = inBox(box(EXIT.x, WALL_Z + 5, 6, 4), s.x, s.z) && vz < -2 && !tr.inside;
      if (wrong || exitOnly) {
        tr.warnAt = now;
        sound.play('deny');
        game.set({
          toast: exitOnly
            ? { title: 'Exit only', body: 'Enter through the ENTRY gate on the left.', tone: 'warn' }
            : { title: 'One way', body: 'The loop runs one way: up the avenue, across the back, down to EXIT.', tone: 'warn' },
        });
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
