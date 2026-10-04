// Static campus diorama: ground, Kenney street tiles, the loop driveway with its yellow kerbs, fenced lots, bays,
// parked cars, trees, wall, buildings, gates. Bays are layout only; zone counts change at the gate cameras.
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { band } from '@/lib/content';
import { game } from '@/lib/game';
import {
  zoneLayout, TAKEN, SLOT_W, SLOT_D, ROAD_W, DRIVES, LOTS, CARPORT, CARPORT_POSTS, HEDGES, ARROWS, STREET_TILES, STREET_T, PROPS, PALMS,
  WALL_SEGMENTS, LOOP_SAMPLES, FORECOURT, GATES, WEST_ST, NORTH_ST,
} from './layout';
import { CAMPUS_EDGE } from './campusData';
import { near } from './state';
import { useCars, useCity, PARKED_MODELS, CITY_MODELS, type CityModel } from './kit';
import Gates from './Gates';
import Buildings from './Buildings';

const BAND = { free: new THREE.Color('#3ccf74'), busy: new THREE.Color('#f6c31c'), full: new THREE.Color('#ff4a3d') };
const PAD = new THREE.Color('#979caf');
const CONCRETE = '#a3a7b8';
const KERB = '#ffc044';
const SY = 4; // vertical scale of kit ground tiles (1 unit square, a few cm thick)

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
  const rows = zoneLayout[0].rows.map((r) => {
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

function ParkedCars({ shadows }: { shadows: boolean }) {
  const { geos, material } = useCars();
  const byModel = useMemo(() => {
    const out = Object.fromEntries(PARKED_MODELS.map((m) => [m, [] as T[]])) as Record<(typeof PARKED_MODELS)[number], T[]>;
    zoneLayout.forEach((z, zi) =>
      z.slots.forEach((s, i) => {
        if (!TAKEN[zi].has(i)) return;
        const m = PARKED_MODELS[(i * 5 + zi * 3 + (i >> 2)) % PARKED_MODELS.length];
        out[m].push({ p: [s.x, 0, s.z], r: s.rot + ((i * 37) % 7 - 3) * 0.012 });
      }),
    );
    return out;
  }, []);
  return <>{PARKED_MODELS.map((m) => byModel[m].length > 0 && <Instanced key={m} items={byModel[m]} geo={geos[m]} material={material} shadows={shadows} />)}</>;
}

// Kenney City Builder pieces: street tiles, lot paving, trees, lamps, the rotonda fountain.
function KitPieces({ shadows }: { shadows: boolean }) {
  const { geos, material } = useCity();
  const byModel = useMemo(() => {
    const out = Object.fromEntries(CITY_MODELS.map((m) => [m, [] as T[]])) as Record<CityModel, T[]>;
    for (const t of STREET_TILES) out[t.model].push({ p: [t.x, -0.02 * SY, t.z], r: t.rot, s: [STREET_T, SY, STREET_T * (t.stretch ?? 1)] });
    for (const [x0, x1, z0, z1] of Object.values(LOTS)) {
      const nx = Math.max(1, Math.round((x1 - x0) / 9));
      const nz = Math.max(1, Math.round((z1 - z0) / 9));
      for (let i = 0; i < nx; i++)
        for (let k = 0; k < nz; k++)
          out.pavement.push({ p: [x0 + ((i + 0.5) * (x1 - x0)) / nx, -0.06 * SY + 0.004, z0 + ((k + 0.5) * (z1 - z0)) / nz], r: ((i + k) % 4) * (Math.PI / 2), s: [(x1 - x0) / nx, SY, (z1 - z0) / nz] });
    }
    for (const [m, x, z, s, r] of PROPS) out[m].push({ p: [x, 0, z], r, s: [s, s, s] });
    return out;
  }, []);
  return <>{CITY_MODELS.map((m) => byModel[m].length > 0 && <Instanced key={m} items={byModel[m]} geo={geos[m]} material={material} shadows={shadows && !m.startsWith('road') && m !== 'pavement'} />)}</>;
}

export default function Campus({ shadows, mobile }: { shadows: boolean; mobile: boolean }) {
  const geos = useMemo(
    () => ({
      line: new THREE.BoxGeometry(0.12, 0.02, SLOT_D),
      stop: new THREE.BoxGeometry(1.6, 0.16, 0.3).translate(0, 0.08, 0),
      palmTrunk: new THREE.CylinderGeometry(0.18, 0.3, 8, 7).translate(0, 4, 0),
      frond: new THREE.BoxGeometry(0.5, 0.06, 3.4).translate(0, 0, 1.7),
      arrow: arrowGeometry(),
      wall: new THREE.BoxGeometry(1, 2.4, 0.4).translate(0, 1.2, 0),
      hedge: new THREE.BoxGeometry(1, 1.15, 1).translate(0, 0.575, 0),
      kerb: new THREE.BoxGeometry(1, 0.2, 0.32).translate(0, 0.1, 0),
      post: new THREE.BoxGeometry(0.24, 3.1, 0.24).translate(0, 1.55, 0),
      ribbon: ribbonGeometry(ROAD_W / 2),
      forecourt: forecourtGeometry(),
      campus: new THREE.ShapeGeometry(new THREE.Shape(CAMPUS_EDGE.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const items = useMemo(() => {
    const lines: T[] = [];
    const stops: T[] = [];
    zoneLayout.forEach((z) =>
      z.slots.forEach((s) => {
        const along = Math.abs(Math.sin(s.rot)) > 0.5; // east/west noses: rows run along z
        for (const side of [-1, 1]) lines.push({ p: along ? [s.x, 0.04, s.z + (side * SLOT_W) / 2] : [s.x + (side * SLOT_W) / 2, 0.04, s.z], r: along ? Math.PI / 2 : 0 });
        stops.push({ p: [s.x + Math.sin(s.rot) * 2.25, 0.02, s.z + Math.cos(s.rot) * 2.25], r: s.rot, c: KERB });
      }),
    );
    const palmTrunks: T[] = PALMS.map(([x, z, s], i) => ({ p: [x, 0.3, z], e: [0.06 * ((i % 3) - 1), 0, 0.05], s: [s, s, s] }));
    const fronds: T[] = PALMS.flatMap(([x, z, s], i) =>
      Array.from({ length: 8 }, (_, k) => ({ p: [x + 0.05 * ((i % 3) - 1) * 8, 8 * s + 0.3, z] as [number, number, number], e: [0.45 + (k % 2) * 0.25, (k / 8) * Math.PI * 2 + i, 0] as [number, number, number], s: [s, s, s] as [number, number, number], c: k % 2 ? '#4f9a3c' : '#3d8433' })),
    );
    const arrows: T[] = ARROWS.map(([x, z, r]) => ({ p: [x, 0.03, z], r }));
    const seg = ([x0, z0, x1, z1]: [number, number, number, number], w = 1): T => ({ p: [(x0 + x1) / 2, 0, (z0 + z1) / 2], r: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, s: [Math.hypot(x1 - x0, z1 - z0) + 0.2, 1, w] });
    const posts: T[] = CARPORT_POSTS.map(([x, z]) => ({ p: [x, 0, z] }));
    return { lines, stops, palmTrunks, fronds, arrows, walls: WALL_SEGMENTS.map((s) => seg(s)), hedges: HEDGES.map((s) => seg(s, 0.9)), kerbs: kerbItems(), posts };
  }, []);

  // Bay pads tint with occupancy heat around the About / Problem / Play chapters.
  const pads = useMemo(() => zoneLayout.map(() => new THREE.MeshStandardMaterial({ color: PAD, roughness: 1 })), []);
  useLayoutEffect(() => () => pads.forEach((m) => m.dispose()), [pads]);
  useFrame(() => {
    const g = game.get();
    const heat = g.driving ? 0 : Math.max(near('about', 0.9), near('problem', 0.9), near('play', 0.8) * 0.6);
    zoneLayout.forEach((z, i) => {
      const b = BAND[band({ ...z, occupied: g.counts[i] })];
      pads[i].color.copy(PAD).lerp(b, heat * 0.65);
      pads[i].emissive.copy(b).multiplyScalar(heat * 0.15);
    });
  });

  const [cx0, cx1, cz0, cz1] = CARPORT;
  return (
    <group>
      {/* ground: verge outside, the campus lawn cut to its OSM outline */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 20]} receiveShadow={shadows}>
        <planeGeometry args={[520, 460]} />
        <meshStandardMaterial color="#9cc98a" roughness={1} />
      </mesh>
      <mesh geometry={geos.campus} position={[0, -0.04, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color="#69bf86" roughness={1} />
      </mesh>
      {/* concrete campus driveways: the loop, the forecourt, Zone C's driveway */}
      <mesh geometry={geos.ribbon} position={[0, 0.012, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>
      <mesh geometry={geos.forecourt} position={[0, 0.008, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color="#b3b6c5" roughness={0.95} />
      </mesh>
      {DRIVES.map(([x, z, w, d]) => (
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x, 0.01, z]} receiveShadow={shadows}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.95} />
        </mesh>
      ))}

      {/* bay pads (tinted by occupancy heat) */}
      {zoneLayout.map((z, i) =>
        z.rows.map((r, k) => {
          const along = r.dz !== 0;
          const len = r.count * SLOT_W;
          return (
            <mesh key={`${z.code}${k}`} rotation-x={-Math.PI / 2} position={[r.x0 + (along ? 0 : len / 2), 0.016, r.z0 + (along ? len / 2 : 0)]} receiveShadow={shadows} material={pads[i]}>
              <planeGeometry args={along ? [SLOT_D, len] : [len, SLOT_D]} />
            </mesh>
          );
        }),
      )}
      {zoneLayout.map((z) => (
        <Html key={z.code} position={[z.tag.x, z.code === 'A' ? 24 : 13, z.tag.z]} center zIndexRange={[1, 0]} className="zone-tag">
          <b>{z.name}</b>
          <span id={`zone-count-${z.code}`}>
            {z.occupied} / {z.capacity}
          </span>
        </Html>
      ))}

      {/* Zone B carport over its west rows */}
      <mesh position={[(cx0 + cx1) / 2, 3.15, (cz0 + cz1) / 2]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[cx1 - cx0 + 0.6, 0.2, cz1 - cz0 + 0.6]} />
        <meshStandardMaterial color="#eef0f4" roughness={0.6} metalness={0.15} />
      </mesh>
      <Instanced items={items.posts} geo={geos.post} color="#a0a8c9" shadows={shadows} />

      <Instanced items={items.lines} geo={geos.line} color="#f4f4f0" shadows={false} />
      <Instanced items={items.stops} geo={geos.stop} shadows={false} />
      <Instanced items={items.arrows} geo={geos.arrow} color="#f4f4f0" shadows={false} />
      <Instanced items={items.kerbs} geo={geos.kerb} color={KERB} shadows={false} />
      <Instanced items={items.hedges} geo={geos.hedge} color="#3d8a4a" shadows={shadows} />
      <Instanced items={items.palmTrunks} geo={geos.palmTrunk} color="#8a7458" shadows={shadows} />
      <Instanced items={items.fronds} geo={geos.frond} shadows={shadows} />
      <Instanced items={items.walls} geo={geos.wall} color="#efe8d8" shadows={shadows} />

      <Suspense fallback={null}>
        <KitPieces shadows={shadows} />
        <ParkedCars shadows={shadows} />
      </Suspense>
      <Buildings shadows={shadows} mobile={mobile} />
      <Gates shadows={shadows} />
    </group>
  );
}
