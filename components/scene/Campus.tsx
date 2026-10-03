// Static campus diorama: roads, zones, parked cars, buildings, trees, gates.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { band } from '@/lib/content';
import {
  zoneLayout, TAKEN, DEMO_SLOT, SLOT_W, SLOT_D, ROADS, BUILDINGS, PAVILION, TREES, BOUNDS,
  MAIN_GATE, EXIT_GATE, AVENUE_Z, FRONT_Z,
} from './layout';
import { near } from './state';

const BAND = { free: new THREE.Color('#3dd68c'), busy: new THREE.Color('#ffc247'), full: new THREE.Color('#ff5c5c') };
const PAD = new THREE.Color('#2b323d');
const CAR_COLORS = ['#c9ced6', '#8e959f', '#2c3138', '#9b3b3b', '#d8d8d4', '#4a5563', '#6b7280'];

type T = { p: [number, number, number]; r?: number; s?: [number, number, number]; c?: string };
const tmp = new THREE.Object3D();
const col = new THREE.Color();

export function Instanced({ items, geo, color, shadows }: { items: T[]; geo: THREE.BufferGeometry; color?: string; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    items.forEach((it, i) => {
      tmp.position.set(...it.p);
      tmp.rotation.set(0, it.r ?? 0, 0);
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
    <instancedMesh ref={ref} args={[geo, undefined, items.length]} castShadow={shadows} receiveShadow={shadows}>
      <meshStandardMaterial color={color ?? '#ffffff'} roughness={0.75} flatShading />
    </instancedMesh>
  );
}

// Low-poly car silhouette (body + cabin) as one geometry so parked cars are a single draw call.
// Local +z is the nose.
export const carGeometry = () => {
  const body = new THREE.BoxGeometry(1.9, 0.75, 4.3).translate(0, 0.62, 0);
  const cabin = new THREE.BoxGeometry(1.65, 0.6, 2.2).translate(0, 1.28, -0.25);
  const merged = mergeGeometries([body, cabin])!;
  body.dispose();
  cabin.dispose();
  return merged;
};

export default function Campus({ shadows }: { shadows: boolean }) {
  const geos = useMemo(
    () => ({
      line: new THREE.BoxGeometry(0.12, 0.02, SLOT_D),
      car: carGeometry(),
      trunk: new THREE.CylinderGeometry(0.25, 0.35, 3, 6).translate(0, 1.5, 0),
      crown: new THREE.IcosahedronGeometry(3.2, 0).translate(0, 5, 0),
      post: new THREE.BoxGeometry(0.25, 2.2, 0.25).translate(0, 1.1, 0),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const { lines, cars, trunks, crowns, posts } = useMemo(() => {
    const lines: T[] = [];
    const cars: T[] = [];
    zoneLayout.forEach((z, zi) => {
      z.slots.forEach((s, i) => {
        lines.push({ p: [s.x - SLOT_W / 2, 0.03, s.z] });
        if (TAKEN[zi].has(i)) cars.push({ p: [s.x, 0, s.z], r: s.facing === 1 ? 0 : Math.PI, c: CAR_COLORS[(i * 7 + zi) % CAR_COLORS.length] });
      });
      z.rows.forEach((r) => lines.push({ p: [r.x0 + r.count * SLOT_W, 0.03, r.z] }));
    });
    const trunks = TREES.map(([x, z, s]) => ({ p: [x, 0, z] as [number, number, number], s: [s, s, s] as [number, number, number] }));
    const crowns = TREES.map(([x, z, s], i) => ({ ...trunks[i], r: i, c: i % 3 ? '#3f6b47' : '#4f7d4a' }));
    // Campus wall as a row of posts, gaps left at both gates
    const posts: T[] = [];
    for (let x = BOUNDS.x0; x <= BOUNDS.x1; x += 2.5) {
      posts.push({ p: [x, 0, BOUNDS.z1] }, { p: [x, 0, BOUNDS.z0] });
    }
    for (let z = BOUNDS.z0; z <= BOUNDS.z1; z += 2.5) {
      if (Math.abs(z - AVENUE_Z) > 6) posts.push({ p: [BOUNDS.x0, 0, z] });
      if (Math.abs(z - FRONT_Z) > 6) posts.push({ p: [BOUNDS.x1, 0, z] });
    }
    return { lines, cars, trunks, crowns, posts };
  }, []);

  // Zone pads tint with occupancy heat around the About / Problem chapters.
  const pads = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(() => {
    const heat = Math.max(near('about', 0.9), near('problem', 0.9), near('play', 0.8) * 0.6);
    zoneLayout.forEach((z, i) => {
      const m = pads.current[i];
      if (!m) return;
      m.color.copy(PAD).lerp(BAND[band(z)], heat * 0.55);
      m.emissive.copy(BAND[band(z)]).multiplyScalar(heat * 0.12);
    });
  });

  return (
    <group>
      {/* ground: campus lawn inside the wall, darker surroundings outside */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -10]} receiveShadow={shadows}>
        <planeGeometry args={[320, 240]} />
        <meshStandardMaterial color="#161b22" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[(BOUNDS.x0 + BOUNDS.x1) / 2, -0.01, (BOUNDS.z0 + BOUNDS.z1) / 2]} receiveShadow={shadows}>
        <planeGeometry args={[BOUNDS.x1 - BOUNDS.x0, BOUNDS.z1 - BOUNDS.z0]} />
        <meshStandardMaterial color="#26352b" roughness={1} />
      </mesh>
      {ROADS.map(([x, z, w, d]) => (
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x, 0, z]} receiveShadow={shadows}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#3a4048" roughness={0.95} />
        </mesh>
      ))}

      {zoneLayout.map((z, i) => (
        <group key={z.code}>
          <mesh rotation-x={-Math.PI / 2} position={[z.center.x, 0.005, z.center.z]} receiveShadow={shadows}>
            <planeGeometry args={[z.box.x1 - z.box.x0, z.box.z1 - z.box.z0]} />
            <meshStandardMaterial ref={(m) => { if (m) pads.current[i] = m; }} color={PAD} roughness={1} />
          </mesh>
          <Html position={[z.center.x, 9, z.center.z]} center zIndexRange={[1, 0]} className="zone-tag">
            <b>{z.name}</b>
            <span id={`zone-count-${z.code}`}>
              {z.occupied} / {z.capacity}
            </span>
          </Html>
        </group>
      ))}

      {/* Zone C carport roofs (photo 5) */}
      {zoneLayout[2].rows.map((r) => (
        <mesh key={r.z} position={[r.x0 + (r.count * SLOT_W) / 2, 3.2, r.z]} rotation-x={0.12} castShadow={shadows}>
          <boxGeometry args={[r.count * SLOT_W + 1, 0.15, SLOT_D + 1]} />
          <meshStandardMaterial color="#59616c" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      <Instanced items={lines} geo={geos.line} color="#d9dee6" shadows={false} />
      <Instanced items={cars} geo={geos.car} shadows={shadows} />
      <Instanced items={trunks} geo={geos.trunk} color="#5a4636" shadows={shadows} />
      <Instanced items={crowns} geo={geos.crown} shadows={shadows} />
      <Instanced items={posts} geo={geos.post} color="#9aa1aa" shadows={false} />

      {BUILDINGS.map(([x, z, w, d, h, c]) => (
        <mesh key={`${x},${z}`} position={[x, h / 2, z]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      ))}
      {/* Laurel building: green balcony rails per floor (photo 1–2) */}
      {[3.6, 7.2].map((y) => (
        <mesh key={y} position={[BUILDINGS[0][0], y, BUILDINGS[0][1] + BUILDINGS[0][3] / 2 + 0.6]}>
          <boxGeometry args={[BUILDINGS[0][2], 0.5, 1.2]} />
          <meshStandardMaterial color="#2f5d45" />
        </mesh>
      ))}
      {/* Main building: rounded glass corner tower (photo 5) + entrance canopy + LPU sign (photo 6) */}
      <mesh position={[-8, 12, -36]} castShadow={shadows}>
        <cylinderGeometry args={[5, 5, 24, 16]} />
        <meshStandardMaterial color="#e3e1db" roughness={0.6} />
      </mesh>
      <mesh position={[16, 4, -31.4]} castShadow={shadows}>
        <boxGeometry args={[12, 0.4, 5]} />
        <meshStandardMaterial color="#eeeeea" />
      </mesh>
      <mesh position={[4, 1.1, -31]} castShadow={shadows}>
        <boxGeometry args={[3, 2.2, 0.8]} />
        <meshStandardMaterial color="#f2c230" />
      </mesh>
      {/* Pavilion with gabled roof (photo 4) */}
      <group position={[PAVILION.x, 0, PAVILION.z]}>
        <mesh position={[0, 3.6, 0]} rotation-z={Math.PI / 4} scale={[1, 1, 1]} castShadow={shadows}>
          <boxGeometry args={[PAVILION.w * 0.5, PAVILION.w * 0.5, PAVILION.d]} />
          <meshStandardMaterial color="#c7ccd2" />
        </mesh>
      </group>

      <Gate at={MAIN_GATE} kind="main" shadows={shadows} />
      <Gate at={EXIT_GATE} kind="exit" shadows={shadows} />

      {/* the free slot the demo car will take, outlined */}
      <mesh rotation-x={-Math.PI / 2} position={[DEMO_SLOT.x, 0.04, DEMO_SLOT.z]}>
        <planeGeometry args={[SLOT_W - 0.4, SLOT_D - 0.4]} />
        <meshBasicMaterial color="#5b92ff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// Main gate: curved stone-pillar canopy and guard booth (photo 1). Exit gate: metal roof + white sliding gate (photo 8).
function Gate({ at, kind, shadows }: { at: THREE.Vector3; kind: 'main' | 'exit'; shadows: boolean }) {
  return (
    <group position={at}>
      {[-5.5, 5.5].map((z) => (
        <mesh key={z} position={[0, 2.6, z]} castShadow={shadows}>
          <boxGeometry args={[1.4, 5.2, 1.4]} />
          <meshStandardMaterial color={kind === 'main' ? '#7d6b58' : '#8a9099'} />
        </mesh>
      ))}
      <mesh position={[0, 5.6, 0]} rotation-x={kind === 'exit' ? 0.08 : 0} castShadow={shadows}>
        <boxGeometry args={[kind === 'main' ? 6 : 5, 0.6, 14]} />
        <meshStandardMaterial color={kind === 'main' ? '#e6e3dc' : '#6d4f3f'} />
      </mesh>
      {kind === 'main' && (
        <mesh position={[1.5, 1.3, 6.8]} castShadow={shadows}>
          <boxGeometry args={[2.6, 2.6, 2]} />
          <meshStandardMaterial color="#d8d4ca" />
        </mesh>
      )}
    </group>
  );
}
