// Static campus diorama: ground, U loop, zones, parked cars, buildings, trees, wall, gates.
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { band } from '@/lib/content';
import {
  zoneLayout, TAKEN, DEMO_SLOT, SLOT_W, SLOT_D, ROADS, ARROWS, BUILDINGS, TOWER, FLOOR_H, PAVILION, PROPS, PALMS,
  BOUNDS, ENTRY, EXIT, GATE_GAP, WEST_X, EAST_X, BASE_Z, STREET_Z, WALL_Z, type Building,
} from './layout';
import { near } from './state';
import { game } from '@/lib/game';
import { useCars, useCity, PARKED_MODELS, CITY_MODELS, type CityModel } from './kit';
import { signTexture } from './signs';
import Gates from './Gates';

const BAND = { free: new THREE.Color('#3ccf74'), busy: new THREE.Color('#f6c31c'), full: new THREE.Color('#ff4a3d') };
const PAD = new THREE.Color('#8a8d92');

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

// Walls, floor trims and glass bands of one building, merged into three geometries.
const buildingGeometry = (b: Building) => {
  const h = b.floors * FLOOR_H;
  const wall = [new THREE.BoxGeometry(b.w, h, b.d).translate(b.x, h / 2, b.z), new THREE.BoxGeometry(b.w + 0.6, 0.9, b.d + 0.6).translate(b.x, h + 0.45, b.z)];
  const glass: THREE.BufferGeometry[] = [];
  const trim: THREE.BufferGeometry[] = [];
  for (let f = 0; f < b.floors; f++) {
    glass.push(new THREE.BoxGeometry(b.w + 0.12, 1.5, b.d + 0.12).translate(b.x, f * FLOOR_H + 1.9, b.z));
    if (f > 0) trim.push(new THREE.BoxGeometry(b.w + 1.4, 0.32, b.d + 1.4).translate(b.x, f * FLOOR_H + 0.16, b.z));
  }
  const merge = (gs: THREE.BufferGeometry[]) => {
    const m = mergeGeometries(gs)!;
    gs.forEach((g) => g.dispose());
    return m;
  };
  return { wall: merge(wall), glass: merge(glass), trim: trim.length ? merge(trim) : null };
};

function Block({ b, shadows }: { b: Building; shadows: boolean }) {
  const g = useMemo(() => buildingGeometry(b), [b]);
  useLayoutEffect(() => () => [g.wall, g.glass, g.trim].forEach((x) => x?.dispose()), [g]);
  return (
    <group>
      <mesh geometry={g.wall} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial color={b.color} roughness={0.85} />
      </mesh>
      <mesh geometry={g.glass}>
        <meshStandardMaterial color="#2c4152" roughness={0.15} metalness={0.5} />
      </mesh>
      {g.trim && (
        <mesh geometry={g.trim} castShadow={shadows}>
          <meshStandardMaterial color={b.trim} roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

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
  return (
    <>
      {PARKED_MODELS.map((m) => byModel[m].length > 0 && <Instanced key={m} items={byModel[m]} geo={geos[m]} material={material} shadows={shadows} />)}
    </>
  );
}

// Trees, street lamps, fountain and the shophouses across the street (Kenney City Builder kit).
function CityProps({ shadows }: { shadows: boolean }) {
  const { geos, material } = useCity();
  const byModel = useMemo(() => {
    const out = Object.fromEntries(CITY_MODELS.map((m) => [m, [] as T[]])) as Record<CityModel, T[]>;
    for (const [m, x, z, s, r] of PROPS) out[m].push({ p: [x, 0, z], r, s: [s, s, s] });
    return out;
  }, []);
  return (
    <>
      {CITY_MODELS.map((m) => byModel[m].length > 0 && <Instanced key={m} items={byModel[m]} geo={geos[m]} material={material} shadows={shadows} />)}
    </>
  );
}

function ZoneSign({ code, at, rot }: { code: string; at: [number, number]; rot: number }) {
  const tex = useMemo(() => signTexture([`ZONE ${code}`, 'GATE CAMERA'], { size: 104 }), [code]);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[at[0], 0, at[1]]} rotation-y={rot}>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.7, -0.05]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.4, 8]} />
          <meshStandardMaterial color="#c9cfd6" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 2.9, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.9, -0.04]} rotation-y={Math.PI}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial color="#c9cfd6" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.25, 3.85, 0.15]}>
        <boxGeometry args={[0.32, 0.26, 0.55]} />
        <meshStandardMaterial color="#f2f2ee" roughness={0.4} />
      </mesh>
    </group>
  );
}

const SIGNS: { code: string; at: [number, number]; rot: number }[] = [
  { code: 'A', at: [WEST_X + 5, 35], rot: 0 },
  { code: 'B', at: [-37, BASE_Z + 4.8], rot: -Math.PI / 2 },
  { code: 'C', at: [EAST_X - 5, -28.5], rot: Math.PI },
];

export default function Campus({ shadows }: { shadows: boolean }) {
  const geos = useMemo(
    () => ({
      line: new THREE.BoxGeometry(0.12, 0.02, SLOT_D),
      stop: new THREE.BoxGeometry(1.6, 0.16, 0.3).translate(0, 0.08, 0),
      palmTrunk: new THREE.CylinderGeometry(0.18, 0.3, 8, 7).translate(0, 4, 0),
      frond: new THREE.BoxGeometry(0.5, 0.06, 3.4).translate(0, 0, 1.7),
      dash: new THREE.BoxGeometry(3, 0.02, 0.18),
      arrow: arrowGeometry(),
      wall: new THREE.BoxGeometry(1, 2.4, 0.4).translate(0, 1.2, 0),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const items = useMemo(() => {
    const lines: T[] = [];
    const stops: T[] = [];
    zoneLayout.forEach((z, zi) =>
      z.slots.forEach((s, i) => {
        const along = Math.abs(Math.sin(s.rot)) > 0.5; // east/west noses: rows run along z
        for (const side of [-1, 1])
          lines.push({ p: along ? [s.x, 0.03, s.z + (side * SLOT_W) / 2] : [s.x + (side * SLOT_W) / 2, 0.03, s.z], r: along ? Math.PI / 2 : 0 });
        stops.push({ p: [s.x + Math.sin(s.rot) * 2.25, 0, s.z + Math.cos(s.rot) * 2.25], r: s.rot, c: '#f6c31c' });
      }),
    );
    const palmTrunks: T[] = PALMS.map(([x, z, s], i) => ({ p: [x, 0, z], e: [0.06 * ((i % 3) - 1), 0, 0.05], s: [s, s, s] }));
    const fronds: T[] = PALMS.flatMap(([x, z, s], i) =>
      Array.from({ length: 8 }, (_, k) => ({ p: [x + 0.05 * ((i % 3) - 1) * 8, 8 * s, z] as [number, number, number], e: [0.45 + (k % 2) * 0.25, (k / 8) * Math.PI * 2 + i, 0] as [number, number, number], s: [s, s, s] as [number, number, number], c: k % 2 ? '#4f9a3c' : '#3d8433' })),
    );
    const dashes: T[] = Array.from({ length: 50 }, (_, i) => ({ p: [-147 + i * 6, 0.02, STREET_Z] }));
    const arrows: T[] = ARROWS.map(([x, z, r]) => ({ p: [x, 0.025, z], r }));
    // wall: unit boxes scaled per segment, gaps at the two gates
    const walls: T[] = [];
    const seg = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      walls.push({ p: [(x0 + x1) / 2, 0, (z0 + z1) / 2], r: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, s: [len, 1, 1] });
    };
    seg(BOUNDS.x0, WALL_Z, ENTRY.x - GATE_GAP - 4.5, WALL_Z);
    seg(ENTRY.x + GATE_GAP, WALL_Z, EXIT.x - GATE_GAP, WALL_Z);
    seg(EXIT.x + GATE_GAP, WALL_Z, BOUNDS.x1, WALL_Z);
    seg(BOUNDS.x0, BOUNDS.z0, BOUNDS.x1, BOUNDS.z0);
    seg(BOUNDS.x0, BOUNDS.z0, BOUNDS.x0, WALL_Z);
    seg(BOUNDS.x1, BOUNDS.z0, BOUNDS.x1, WALL_Z);
    return { lines, stops, palmTrunks, fronds, dashes, arrows, walls };
  }, []);

  // Zone pads tint with occupancy heat around the About / Problem / Play chapters.
  const pads = useMemo(() => zoneLayout.map(() => new THREE.MeshStandardMaterial({ color: PAD, roughness: 1 })), []);
  useLayoutEffect(() => () => pads.forEach((m) => m.dispose()), [pads]);
  useFrame(() => {
    const heat = game.get().driving ? 0 : Math.max(near('about', 0.9), near('problem', 0.9), near('play', 0.8) * 0.6);
    zoneLayout.forEach((z, i) => {
      const m = pads[i];
      m.color.copy(PAD).lerp(BAND[band(z)], heat * 0.6);
      m.emissive.copy(BAND[band(z)]).multiplyScalar(heat * 0.15);
    });
  });

  const cx = (BOUNDS.x0 + BOUNDS.x1) / 2;
  const cz = (BOUNDS.z0 + BOUNDS.z1) / 2;
  return (
    <group>
      {/* ground: dry verge outside, campus lawn inside, sidewalk along the street wall */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow={shadows}>
        <planeGeometry args={[420, 320]} />
        <meshStandardMaterial color="#a7b97f" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, -0.02, cz]} receiveShadow={shadows}>
        <planeGeometry args={[BOUNDS.x1 - BOUNDS.x0, BOUNDS.z1 - BOUNDS.z0]} />
        <meshStandardMaterial color="#7fb357" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.015, WALL_Z + 1.6]} receiveShadow={shadows}>
        <planeGeometry args={[300, 3.2]} />
        <meshStandardMaterial color="#d6d0c2" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[BUILDINGS.core.x, -0.012, BUILDINGS.core.z]} receiveShadow={shadows}>
        <planeGeometry args={[BUILDINGS.core.w + 8, BUILDINGS.core.d + 8]} />
        <meshStandardMaterial color="#d9d3c5" roughness={1} />
      </mesh>
      {ROADS.map(([x, z, w, d]) => (
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x, 0, z]} receiveShadow={shadows}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#62656b" roughness={0.95} />
        </mesh>
      ))}

      {zoneLayout.map((z, i) => (
        <group key={z.code}>
          {z.rows.map((r, k) => {
            const along = r.dz !== 0;
            const len = r.count * SLOT_W;
            const x = r.x0 + (along ? 0 : len / 2);
            const zz = r.z0 + (along ? (r.dz * r.count) / 2 : 0);
            return (
              <mesh key={k} rotation-x={-Math.PI / 2} position={[x, 0.008, zz]} receiveShadow={shadows} material={pads[i]}>
                <planeGeometry args={along ? [SLOT_D, len] : [len, SLOT_D]} />
              </mesh>
            );
          })}
          <Html position={[z.center.x, 10, z.center.z]} center zIndexRange={[1, 0]} className="zone-tag">
            <b>{z.name}</b>
            <span id={`zone-count-${z.code}`}>
              {z.occupied} / {z.capacity}
            </span>
          </Html>
        </group>
      ))}
      {SIGNS.map((s) => (
        <ZoneSign key={s.code} {...s} />
      ))}

      {/* Zone B carports over the north row (photos 4–5) */}
      {(() => {
        const r = zoneLayout[1].rows[0];
        const len = r.count * SLOT_W;
        return (
          <group position={[r.x0 + len / 2, 0, r.z0]}>
            <mesh position={[0, 3.3, 0]} rotation-x={-0.1} castShadow={shadows}>
              <boxGeometry args={[len + 1, 0.16, SLOT_D + 1.6]} />
              <meshStandardMaterial color="#2f5d48" roughness={0.6} metalness={0.2} />
            </mesh>
            {Array.from({ length: 9 }, (_, k) => (
              <mesh key={k} position={[-len / 2 + (k * len) / 8, 1.6, -SLOT_D / 2 - 0.3]} castShadow={shadows}>
                <boxGeometry args={[0.2, 3.3, 0.2]} />
                <meshStandardMaterial color="#c9cfd6" metalness={0.5} roughness={0.4} />
              </mesh>
            ))}
          </group>
        );
      })()}

      <Instanced items={items.lines} geo={geos.line} color="#f4f4f0" shadows={false} />
      <Instanced items={items.stops} geo={geos.stop} shadows={false} />
      <Instanced items={items.dashes} geo={geos.dash} color="#f4f4f0" shadows={false} />
      <Instanced items={items.arrows} geo={geos.arrow} color="#f4f4f0" shadows={false} />
      <Instanced items={items.palmTrunks} geo={geos.palmTrunk} color="#8a7458" shadows={shadows} />
      <Instanced items={items.fronds} geo={geos.frond} shadows={shadows} />
      <Instanced items={items.walls} geo={geos.wall} color="#efe8d8" shadows={shadows} />

      <Suspense fallback={null}>
        <ParkedCars shadows={shadows} />
        <CityProps shadows={shadows} />
      </Suspense>

      {Object.values(BUILDINGS).map((b) => (
        <Block key={`${b.x},${b.z}`} b={b} shadows={shadows} />
      ))}
      {/* Laurel: green balcony rails facing the avenue */}
      {[1, 2].map((f) => (
        <mesh key={f} position={[BUILDINGS.laurel.x + BUILDINGS.laurel.w / 2 + 0.9, f * FLOOR_H + 0.6, BUILDINGS.laurel.z]} castShadow={shadows}>
          <boxGeometry args={[1.8, 1.1, BUILDINGS.laurel.d]} />
          <meshStandardMaterial color="#2f7a4c" roughness={0.7} />
        </mesh>
      ))}
      {/* main building: round glass corner tower + entrance canopy + yellow LPU marker (photos 5–6) */}
      <group position={[TOWER.x, 0, TOWER.z]}>
        <mesh position={[0, (TOWER.floors * FLOOR_H) / 2, 0]} castShadow={shadows}>
          <cylinderGeometry args={[TOWER.r, TOWER.r, TOWER.floors * FLOOR_H, 28]} />
          <meshStandardMaterial color="#f4f2ec" roughness={0.6} />
        </mesh>
        {Array.from({ length: TOWER.floors }, (_, f) => (
          <mesh key={f} position={[0, f * FLOOR_H + 1.9, 0]}>
            <cylinderGeometry args={[TOWER.r + 0.06, TOWER.r + 0.06, 1.6, 28, 1, true]} />
            <meshStandardMaterial color="#2c4152" roughness={0.15} metalness={0.5} />
          </mesh>
        ))}
      </group>
      <mesh position={[BUILDINGS.main.x - BUILDINGS.main.w / 2 - 3, 4.2, -6]} castShadow={shadows}>
        <boxGeometry args={[6, 0.35, 12]} />
        <meshStandardMaterial color="#f7f7f4" roughness={0.4} />
      </mesh>
      <mesh position={[EAST_X + 11, 1.3, -14]} castShadow={shadows}>
        <boxGeometry args={[0.9, 2.6, 0.9]} />
        <meshStandardMaterial color="#f6c31c" roughness={0.6} />
      </mesh>
      {/* pavilion with a gabled green roof (photo 4) */}
      <group position={[PAVILION.x, 0, PAVILION.z]}>
        <mesh position={[0, 3.8, 0]} rotation-x={-Math.PI / 2} scale={[PAVILION.w / 2 + 0.6, 1, 1.4]} castShadow={shadows}>
          <cylinderGeometry args={[1, 1, PAVILION.d + 1, 3, 1]} />
          <meshStandardMaterial color="#2f7a4c" roughness={0.6} />
        </mesh>
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * PAVILION.w * 0.22, 1.5, sz * (PAVILION.d / 2 - 0.4)]} castShadow={shadows}>
              <boxGeometry args={[0.35, 3, 0.35]} />
              <meshStandardMaterial color="#efe8d8" />
            </mesh>
          )),
        )}
      </group>

      <Gates shadows={shadows} />

      {/* the free slot the demo car will take */}
      <mesh rotation-x={-Math.PI / 2} position={[DEMO_SLOT.x, 0.04, DEMO_SLOT.z]}>
        <planeGeometry args={[SLOT_D - 0.5, SLOT_W - 0.4]} />
        <meshBasicMaterial color="#f6c31c" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

