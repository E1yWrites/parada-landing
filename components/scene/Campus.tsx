// Static campus: ground, streets with sidewalks and electric poles, the loop driveway with its yellow kerbs,
// Zone A's bays, parked cars, trees, wall, buildings, gates. Bays are layout only; the count changes at the gate
// cameras.
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { band } from '@/lib/content';
import { game } from '@/lib/game';
import {
  ZONE_A, TAKEN, SLOT_W, SLOT_D, ROAD_W, ARROWS, STREET_T, POLE_RUNS, ROTONDA,
  WALL_SEGMENTS, LOOP_SAMPLES, FORECOURT, GATES, WEST_ST, NORTH_ST, EAST_ST,
} from './layout';
import { CAMPUS_EDGE } from './campusData';
import { near } from './state';
import { useCars, PARKED_MODELS } from './kit';
import { weathered } from './materials';
import Gates from './Gates';
import Buildings from './Buildings';
import Trees from './Trees';

const BAND = { free: new THREE.Color('#3ccf74'), busy: new THREE.Color('#f6c31c'), full: new THREE.Color('#ff4a3d') };
const PAD = new THREE.Color('#9d9a93');
const CONCRETE = '#bdb9b0';
const ASPHALT = '#55585c';
const SIDEWALK = '#c9c5bc';
const KERB = '#f2c13a';

type T = { p: [number, number, number]; r?: number; e?: [number, number, number]; s?: [number, number, number]; c?: string };
const tmp = new THREE.Object3D();
const col = new THREE.Color();

export function Instanced({ items, geo, color, shadows, material }: { items: T[]; geo: THREE.BufferGeometry; color?: string; shadows: boolean; material?: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    items.forEach((it, i) => {
      tmp.position.set(...it.p);
      if (it.e) tmp.rotation.set(...it.e, 'YXZ');
      else tmp.rotation.set(0, it.r ?? 0, 0);
      tmp.scale.set(...(it.s ?? [1, 1, 1]));
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
      if (it.c) ref.current.setColorAt(i, col.set(it.c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[geo, material, items.length]} castShadow={shadows} receiveShadow={shadows}>
      {!material && <meshStandardMaterial color={color ?? '#ffffff'} roughness={0.8} flatShading />}
    </instancedMesh>
  );
}

const arrowGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.35, -1.6).lineTo(0.35, -1.6).lineTo(0.35, 0.2).lineTo(0.9, 0.2).lineTo(0, 1.6).lineTo(-0.9, 0.2).lineTo(-0.35, 0.2).closePath();
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2).rotateY(Math.PI); // points along +z before rotation
};

// The loop driveway as one flat ribbon along its centreline.
const ribbonGeometry = (half: number) => {
  const pos: number[] = [];
  const idx: number[] = [];
  LOOP_SAMPLES.forEach((s, i) => {
    pos.push(s.x + s.tz * half, 0, s.z - s.tx * half, s.x - s.tz * half, 0, s.z + s.tx * half);
    if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (g.getAttribute('normal').getY(0) < 0) g.setIndex(idx.map((_, k) => idx[k - (k % 3) + [0, 2, 1][k % 3]]));
  g.computeVertexNormals();
  return g;
};

// Forecourt under the canopy: a disc clipped to the two streets' kerbs.
const forecourtGeometry = () => {
  const xMin = WEST_ST + STREET_T / 2;
  const zMin = NORTH_ST + STREET_T / 2;
  const pts = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    return new THREE.Vector2(Math.max(xMin, FORECOURT.x + Math.cos(a) * FORECOURT.r), -Math.max(zMin, FORECOURT.z + Math.sin(a) * FORECOURT.r));
  });
  return new THREE.ShapeGeometry(new THREE.Shape(pts)).rotateX(-Math.PI / 2);
};

// Yellow kerbs along both edges of the loop, left open where bays, gates or the street meet it.
const kerbItems = (): T[] => {
  const rows = ZONE_A.rows.map((r) => {
    const len = r.count * SLOT_W;
    return [r.x0 - SLOT_D / 2 - 0.9, r.x0 + SLOT_D / 2 + 0.9, r.z0 - 0.9, r.z0 + len + 0.9];
  });
  const openAt = (x: number, z: number) =>
    rows.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1) ||
    Math.hypot(x - GATES.main.x, z - GATES.main.z) < 6 ||
    Math.hypot(x - GATES.north.x, z - GATES.north.z) < 6.5 ||
    z < NORTH_ST + STREET_T / 2 + 1.5 ||
    Math.hypot(x - FORECOURT.x, z - FORECOURT.z) < FORECOURT.r + 3;
  const out: T[] = [];
  const half = ROAD_W / 2 + 0.16;
  for (const side of [1, -1])
    for (let i = 1; i < LOOP_SAMPLES.length; i++) {
      const a = LOOP_SAMPLES[i - 1];
      const b = LOOP_SAMPLES[i];
      const ax = a.x + side * a.tz * half;
      const az = a.z - side * a.tx * half;
      const bx = b.x + side * b.tz * half;
      const bz = b.z - side * b.tx * half;
      const mx = (ax + bx) / 2;
      const mz = (az + bz) / 2;
      if (openAt(mx, mz)) continue;
      out.push({ p: [mx, 0, mz], r: Math.atan2(bx - ax, bz - az) + Math.PI / 2, s: [Math.hypot(bx - ax, bz - az) + 0.04, 1, 1] });
    }
  return out;
};

// Shadows are baked, not re-rendered every frame (Scene turns shadowMap.autoUpdate off): static scenery asks for
// one shadow pass when it mounts, and wakes a sleeping render loop so the pass happens.
function useBakeShadows() {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  useLayoutEffect(() => {
    gl.shadowMap.needsUpdate = true;
    if (get().frameloop === 'never') get().setFrameloop('always');
  }, [gl, get]);
}

function ParkedCars({ shadows }: { shadows: boolean }) {
  useBakeShadows(); // the cars arrive after the rest of the campus (their model loads)
  const { geos, material } = useCars();
  const byModel = useMemo(() => {
    const out = Object.fromEntries(PARKED_MODELS.map((m) => [m, [] as T[]])) as Record<(typeof PARKED_MODELS)[number], T[]>;
    ZONE_A.slots.forEach((s, i) => {
      if (!TAKEN.has(i)) return;
      const m = PARKED_MODELS[(i * 5 + (i >> 2)) % PARKED_MODELS.length];
      out[m].push({ p: [s.x, 0, s.z], r: s.rot + ((i * 37) % 7 - 3) * 0.012 });
    });
    return out;
  }, []);
  return <>{PARKED_MODELS.map((m) => byModel[m].length > 0 && <Instanced key={m} items={byModel[m]} geo={geos[m]} material={material} shadows={shadows} />)}</>;
}

// Public streets: asphalt corridors, raised sidewalks (left open at the forecourt and the north gate), lane dashes.
const H = STREET_T / 2;
const SIDEWALKS: [number, number, number, number][] = [
  // [x0, x1, z0, z1]
  [WEST_ST - H, WEST_ST - H + 1.6, -186, NORTH_ST - H], [WEST_ST - H, WEST_ST - H + 1.6, NORTH_ST + H, 236],
  [WEST_ST + H - 1.6, WEST_ST + H, -186, NORTH_ST - H], [WEST_ST + H - 1.6, WEST_ST + H, -52, 236],
  [WEST_ST + H, EAST_ST - H, NORTH_ST - H, NORTH_ST - H + 1.6],
  [-59, GATES.north.x - ROAD_W / 2 - 0.5, NORTH_ST + H - 1.6, NORTH_ST + H], [GATES.north.x + ROAD_W / 2 + 0.5, EAST_ST - H, NORTH_ST + H - 1.6, NORTH_ST + H],
  [EAST_ST - H, EAST_ST - H + 1.6, NORTH_ST + H, 236], [EAST_ST + H - 1.6, EAST_ST + H, NORTH_ST - H, 236],
];
const dashes = (): T[] => {
  const out: T[] = [];
  for (let z = -184; z < 234; z += 7) if (Math.abs(z - NORTH_ST) > 9) out.push({ p: [WEST_ST, 0.03, z], r: 0 });
  for (let z = NORTH_ST + 9; z < 234; z += 7) out.push({ p: [EAST_ST, 0.03, z], r: 0 });
  return out;
};
// Concrete poles with a crossarm, three sagging wires pole to pole.
function Poles({ shadows }: { shadows: boolean }) {
  const geos = useMemo(() => {
    const pole = new THREE.CylinderGeometry(0.13, 0.2, 9.5, 6).translate(0, 4.75, 0);
    const arm = new THREE.BoxGeometry(1.9, 0.14, 0.14).translate(0, 8.9, 0);
    const wire: number[] = [];
    for (const run of POLE_RUNS)
      for (let i = 1; i < run.length; i++) {
        const [ax, az] = run[i - 1];
        const [bx, bz] = run[i];
        const L = Math.hypot(bx - ax, bz - az);
        const nx = -(bz - az) / L;
        const nz = (bx - ax) / L;
        for (const o of [-0.8, 0, 0.8])
          for (let k = 0; k < 12; k++) {
            for (const t of [k / 12, (k + 1) / 12]) wire.push(ax + (bx - ax) * t + nx * o, 9 - Math.sin(Math.PI * t) * 0.9, az + (bz - az) * t + nz * o);
          }
      }
    const lines = new THREE.BufferGeometry();
    lines.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
    return { pole, arm, lines };
  }, []);
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  const items = useMemo(
    () =>
      POLE_RUNS.flatMap((run) =>
        run.map(([x, z], i): T => {
          const [bx, bz] = run[Math.min(i + 1, run.length - 1)];
          const [ax, az] = run[Math.max(i - 1, 0)];
          return { p: [x, 0, z], r: Math.atan2(bx - ax, bz - az) + Math.PI / 2 };
        }),
      ),
    [],
  );
  return (
    <>
      <Instanced items={items} geo={geos.pole} color="#b8b4ab" shadows={shadows} />
      <Instanced items={items} geo={geos.arm} color="#8d8a84" shadows={false} />
      <lineSegments geometry={geos.lines}>
        <lineBasicMaterial color="#2b2b2b" />
      </lineSegments>
    </>
  );
}

export default function Campus({ shadows, mobile }: { shadows: boolean; mobile: boolean }) {
  useBakeShadows();
  const geos = useMemo(
    () => ({
      line: new THREE.BoxGeometry(0.12, 0.02, SLOT_D),
      stop: new THREE.BoxGeometry(1.6, 0.16, 0.3).translate(0, 0.08, 0),
      arrow: arrowGeometry(),
      dash: new THREE.BoxGeometry(0.15, 0.02, 3),
      wall: new THREE.BoxGeometry(1, 2.4, 0.4).translate(0, 1.2, 0),
      kerb: new THREE.BoxGeometry(1, 0.2, 0.32).translate(0, 0.1, 0),
      ribbon: ribbonGeometry(ROAD_W / 2),
      forecourt: forecourtGeometry(),
      campus: new THREE.ShapeGeometry(new THREE.Shape(CAMPUS_EDGE.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2),
      sidewalks: mergeBoxes(SIDEWALKS.map(([x0, x1, z0, z1]) => [x0, -0.05, z0, x1, 0.15, z1])),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  const mats = useMemo(
    () => ({
      verge: weathered(new THREE.MeshStandardMaterial({ color: '#93a878', roughness: 1 }), 0.2, 7),
      lawn: weathered(new THREE.MeshStandardMaterial({ color: '#78a062', roughness: 1 }), 0.22, 5),
      asphalt: weathered(new THREE.MeshStandardMaterial({ color: ASPHALT, roughness: 0.95 }), 0.12, 1.6),
      concrete: weathered(new THREE.MeshStandardMaterial({ color: CONCRETE, roughness: 0.95 }), 0.1, 2),
      sidewalk: weathered(new THREE.MeshStandardMaterial({ color: SIDEWALK, roughness: 0.95 }), 0.1, 1.5),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const items = useMemo(() => {
    const lines: T[] = [];
    const stops: T[] = [];
    ZONE_A.slots.forEach((s) => {
      for (const side of [-1, 1]) lines.push({ p: [s.x, 0.04, s.z + (side * SLOT_W) / 2], r: Math.PI / 2 });
      stops.push({ p: [s.x + Math.sin(s.rot) * 2.25, 0.02, s.z + Math.cos(s.rot) * 2.25], r: s.rot, c: KERB });
    });
    const arrows: T[] = ARROWS.map(([x, z, r]) => ({ p: [x, 0.03, z], r }));
    const seg = ([x0, z0, x1, z1]: [number, number, number, number], w = 1): T => ({ p: [(x0 + x1) / 2, 0, (z0 + z1) / 2], r: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, s: [Math.hypot(x1 - x0, z1 - z0) + 0.2, 1, w] });
    return { lines, stops, arrows, walls: WALL_SEGMENTS.map((s) => seg(s)), kerbs: kerbItems(), dashes: dashes() };
  }, []);

  // Bay pads tint with occupancy heat around the About / Problem / Play chapters.
  const pad = useMemo(() => new THREE.MeshStandardMaterial({ color: PAD, roughness: 1 }), []);
  useLayoutEffect(() => () => pad.dispose(), [pad]);
  useFrame(() => {
    const g = game.get();
    const heat = g.driving ? 0 : Math.max(near('about', 0.9), near('play', 0.8) * 0.6);
    const b = BAND[band({ ...ZONE_A, occupied: g.counts[0] })];
    pad.color.copy(PAD).lerp(b, heat * 0.65);
    pad.emissive.copy(b).multiplyScalar(heat * 0.15);
  });

  return (
    <group>
      {/* ground: verge outside, the campus lawn cut to its OSM outline */}
      {/* reaches well past the faded edge (fogFade.ts), so no rim of the world is ever seen */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 25]} receiveShadow={shadows} material={mats.verge}>
        <planeGeometry args={[720, 720]} />
      </mesh>
      <mesh geometry={geos.campus} position={[0, -0.04, 0]} receiveShadow={shadows} material={mats.lawn} />
      {/* streets */}
      {[[WEST_ST, 25, STREET_T, 422], [(WEST_ST + EAST_ST) / 2, NORTH_ST, EAST_ST - WEST_ST + STREET_T, STREET_T], [EAST_ST, 80, STREET_T, 322]].map(([x, z, w, d]) => (
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x, -0.01, z]} receiveShadow={shadows} material={mats.asphalt}>
          <planeGeometry args={[w, d]} />
        </mesh>
      ))}
      <mesh geometry={geos.sidewalks} receiveShadow={shadows} material={mats.sidewalk} />
      <Instanced items={items.dashes} geo={geos.dash} color="#efece4" shadows={false} />
      {/* concrete campus driveways: the loop and the forecourt */}
      <mesh geometry={geos.ribbon} position={[0, 0.012, 0]} receiveShadow={shadows} material={mats.concrete} />
      <mesh geometry={geos.forecourt} position={[0, 0.008, 0]} receiveShadow={shadows} material={mats.concrete} />

      {/* Zone A's bay pads (tinted by occupancy heat) */}
      {ZONE_A.rows.map((r, k) => {
        const len = r.count * SLOT_W;
        return (
          <mesh key={k} rotation-x={-Math.PI / 2} position={[r.x0, 0.016, r.z0 + len / 2]} receiveShadow={shadows} material={pad}>
            <planeGeometry args={[SLOT_D, len]} />
          </mesh>
        );
      })}
      <Html position={[ZONE_A.tag.x, 24, ZONE_A.tag.z]} center zIndexRange={[1, 0]} className="zone-tag">
        <b>{ZONE_A.name}</b>
        <span id="zone-count-A">
          {ZONE_A.occupied} / {ZONE_A.capacity}
        </span>
      </Html>

      {/* rotonda fountain */}
      <group position={[ROTONDA.x, 0, ROTONDA.z]}>
        <mesh castShadow={shadows} receiveShadow={shadows}>
          <cylinderGeometry args={[ROTONDA.r, ROTONDA.r + 0.2, 0.6, 32]} />
          <meshStandardMaterial color="#d8d3c8" roughness={0.9} />
        </mesh>
        <mesh position-y={0.55}>
          <cylinderGeometry args={[ROTONDA.r - 0.45, ROTONDA.r - 0.45, 0.1, 32]} />
          <meshStandardMaterial color="#6fa3b8" roughness={0.15} metalness={0.2} />
        </mesh>
        <mesh position-y={1.1} castShadow={shadows}>
          <cylinderGeometry args={[0.5, 0.9, 1.2, 16]} />
          <meshStandardMaterial color="#e4dfd4" roughness={0.85} />
        </mesh>
      </group>

      <Instanced items={items.lines} geo={geos.line} color="#f4f4f0" shadows={false} />
      <Instanced items={items.stops} geo={geos.stop} shadows={false} />
      <Instanced items={items.arrows} geo={geos.arrow} color="#f4f4f0" shadows={false} />
      <Instanced items={items.kerbs} geo={geos.kerb} color={KERB} shadows={false} />
      <Instanced items={items.walls} geo={geos.wall} color="#ece6d8" shadows={shadows} />
      <Poles shadows={shadows} />
      <Trees shadows={shadows} mobile={mobile} />

      <Suspense fallback={null}>
        <ParkedCars shadows={shadows} />
      </Suspense>
      <Buildings shadows={shadows} />
      <Gates shadows={shadows} />
    </group>
  );
}

// Axis-aligned boxes [x0, y0, z0, x1, y1, z1] merged into one geometry.
function mergeBoxes(list: [number, number, number, number, number, number][]) {
  if (!list.length) return new THREE.BufferGeometry();
  return mergeGeometries(list.map(([x0, y0, z0, x1, y1, z1]) => new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)))!;
}
