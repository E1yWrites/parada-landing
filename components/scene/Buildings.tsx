// Campus buildings extruded from footprints traced off satellite imagery, in the Kenney City Builder style
// (palette sampled from the kit's colormap): grey plinth, floor bands, framed windows, lavender parapet, rooftop
// units; plus the covered walkways, the pavilion and the main entrance. The houses round the campus are the kit's
// own buildings, placed on their OpenStreetMap footprints.
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BLOCKS, BIG_NEIGHBOURS, ENTRANCE, ISLAND, PAVILION, PAVILION_POSTS, WALKWAYS, WALKWAY_POSTS, WALKWAY_H, FLOOR_H, HOUSE_PROPS, type Block } from './layout';
import { useCity, CITY_MODELS, type CityModel } from './kit';
import { signTexture } from './signs';

// Kenney colormap swatches
const K = { plinth: '#868ba1', rim: '#a0a8c9', roof: '#7d8299', white: '#ffffff', glass: '#38383d', sky: '#6794d9', dark: '#4f5260' };

type Part = { g: THREE.BufferGeometry; c: string };
const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string): Part => ({
  g: new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
  c,
});
const tint = (parts: Part[]) => {
  const col = new THREE.Color();
  const geos = parts.map(({ g, c }) => {
    col.set(c);
    const n = g.getAttribute('position').count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.toArray(arr, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return g;
  });
  const merged = mergeGeometries(geos)!;
  geos.forEach((g) => g.dispose());
  return merged;
};
const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// One block: body, plinth, bands, parapet, roof clutter, rails. Returns coloured parts plus window slots.
type Win = { x: number; y: number; z: number; rot: number; w: number; h: number };
function blockParts(b: Block, seed: number, detail: boolean) {
  const parts: Part[] = [];
  const wins: Win[] = [];
  const bands: Part[] = [];
  const H = b.floors * FLOOR_H;
  const band = b.wall === '#ffffff' || b.wall.startsWith('#f6') || b.wall.startsWith('#ef') ? K.rim : K.white;
  parts.push(box(b.x0, 0, b.z0, b.x1, H, b.z1, b.wall));
  parts.push(box(b.x0 - 0.12, 0, b.z0 - 0.12, b.x1 + 0.12, 1.1, b.z1 + 0.12, K.plinth));
  for (let f = 1; f < b.floors; f++) parts.push(box(b.x0 - 0.3, f * FLOOR_H - 0.18, b.z0 - 0.3, b.x1 + 0.3, f * FLOOR_H + 0.18, b.z1 + 0.3, band));
  // roof: slab, parapet rim
  parts.push(box(b.x0 + 0.3, H, b.z0 + 0.3, b.x1 - 0.3, H + 0.15, b.z1 - 0.3, K.roof));
  const t = 0.7;
  const top = H + 1;
  parts.push(
    box(b.x0 - 0.2, H, b.z0 - 0.2, b.x1 + 0.2, top, b.z0 + t, K.rim),
    box(b.x0 - 0.2, H, b.z1 - t, b.x1 + 0.2, top, b.z1 + 0.2, K.rim),
    box(b.x0 - 0.2, H, b.z0 + t, b.x0 + t, top, b.z1 - t, K.rim),
    box(b.x1 - t, H, b.z0 + t, b.x1 + 0.2, top, b.z1 - t, K.rim),
  );
  const w = b.x1 - b.x0;
  const d = b.z1 - b.z0;
  if (detail) {
    const r = rand(seed);
    // rooftop units and the flat service hatches Kenney scatters on roofs
    const n = Math.round((w * d) / 260) + 2;
    for (let i = 0; i < n; i++) {
      const cx = b.x0 + 2.5 + r() * (w - 5);
      const cz = b.z0 + 2.5 + r() * (d - 5);
      if (b.skylights && Math.abs(cx - (b.x0 + b.x1) / 2) < w * 0.3) continue;
      const kind = r();
      if (kind < 0.45) parts.push(box(cx - 1.1, H + 0.15, cz - 0.8, cx + 1.1, H + 1.4, cz + 0.8, K.rim));
      else if (kind < 0.75) parts.push(box(cx - 0.9, H + 0.15, cz - 0.9, cx + 0.9, H + 0.3, cz + 0.9, '#c3c7de'));
      else parts.push(box(cx - 1.6, H + 0.15, cz - 1.6, cx + 1.6, H + 2.6, cz + 1.6, b.wall));
    }
    if (b.skylights) {
      for (let z = b.z0 + 4; z < b.z1 - 3; z += 5.5)
        for (const fx of [0.36, 0.64]) {
          const x = b.x0 + w * fx;
          parts.push(box(x - 1.2, H + 0.15, z - 1.2, x + 1.2, H + 0.5, z + 1.2, K.glass));
        }
    }
  }
  // balcony slabs + rails on one long face
  if (b.rails) {
    const xs = b.railsSide === 'w' ? [b.x0 - 1.4, b.x0] : [b.x1, b.x1 + 1.4];
    for (let f = 1; f < b.floors; f++) {
      parts.push(box(xs[0], f * FLOOR_H - 0.2, b.z0 + 1, xs[1], f * FLOOR_H + 0.05, b.z1 - 1, K.white));
      const rx = b.railsSide === 'w' ? xs[0] : xs[1] - 0.12;
      parts.push(box(rx, f * FLOOR_H + 0.05, b.z0 + 1, rx + 0.12, f * FLOOR_H + 1.05, b.z1 - 1, b.rails));
    }
  }
  // windows: framed openings every ~3.3 m per floor on all four faces (wide glass on the hall)
  const step = b.skylights ? 4.6 : 3.3;
  const faces: [number, number, number, number, number][] = [
    // [startX, startZ, dirX, dirZ, length] walking along the face; rot faces outward
    [b.x0, b.z1, 1, 0, w],
    [b.x1, b.z0, -1, 0, w],
    [b.x0, b.z0, 0, 1, d],
    [b.x1, b.z1, 0, -1, d],
  ];
  const rots = [0, Math.PI, -Math.PI / 2, Math.PI / 2];
  faces.forEach(([sx, sz, dx, dz, L], fi) => {
    const n = Math.floor((L - 2) / step);
    if (n < 1) return;
    const pad = (L - n * step) / 2;
    for (let f = 0; f < b.floors; f++)
      for (let i = 0; i < n; i++) {
        const along = pad + step * (i + 0.5);
        const y = f * FLOOR_H + (f === 0 ? 2 : 1.95);
        wins.push({ x: sx + dx * along, y, z: sz + dz * along, rot: rots[fi], w: b.skylights ? 3.2 : 1.8, h: f === 0 ? 1.7 : 1.6 });
      }
  });
  return { parts, wins, bands };
}

const entranceParts = () => {
  const { x, z, w, d } = ENTRANCE;
  const parts: Part[] = [box(x - w / 2, 4.1, z - d / 2, x + w / 2, 4.5, z + d / 2, K.white)];
  for (const pz of [z - d / 2 + 0.4, z + d / 2 - 0.4]) parts.push(box(x - w / 2 + 0.2, 0, pz - 0.2, x - w / 2 + 0.6, 4.1, pz + 0.2, K.rim));
  // doors on the building face under the canopy
  parts.push(box(x + w / 2 - 0.1, 0, z - 2.4, x + w / 2 + 0.05, 2.8, z + 2.4, K.glass));
  // the lawn island's yellow kerb, with three flagpoles at its south end
  const [ix0, ix1, iz0, iz1] = ISLAND;
  parts.push(box(ix0, 0, iz0, ix1, 0.25, iz1, '#ffc044'), box(ix0 + 0.3, 0.25, iz0 + 0.3, ix1 - 0.3, 0.32, iz1 - 0.3, '#61cb8b'));
  for (let i = 0; i < 3; i++) {
    const fz = iz1 - 2.6 + i * 1;
    parts.push(box(ix1 - 1.1, 0, fz - 0.06, ix1 - 0.98, 9, fz + 0.06, K.white));
    parts.push(box(ix1 - 0.98, 7.6, fz - 0.03, ix1 + 0.6, 8.6, fz + 0.03, ['#cf534f', '#6794d9', '#ffc044'][i]));
  }
  return parts;
};

// Open pavilion inside the loop: white posts under a low white hipped roof (white in the imagery).
const pavilionParts = () => {
  const { x, z, w, d } = PAVILION;
  const parts: Part[] = [box(x - w / 2, 0, z - d / 2, x + w / 2, 0.2, z + d / 2, '#c3c7de')];
  for (const [px, pz] of PAVILION_POSTS) parts.push(box(px - 0.2, 0.2, pz - 0.2, px + 0.2, 3.2, pz + 0.2, K.white));
  parts.push(box(x - w / 2 - 0.4, 3.2, z - d / 2 - 0.4, x + w / 2 + 0.4, 3.55, z + d / 2 + 0.4, K.rim));
  const hip = new THREE.CylinderGeometry(0.62, 1, 1, 4, 1).rotateY(Math.PI / 4);
  hip.scale((w + 0.8) / 1.414, 1.3, (d + 0.8) / 1.414).translate(x, 3.55 + 0.65, z);
  parts.push({ g: hip, c: '#f4f6f8' });
  return parts;
};

// Covered walkways: a white roof slab with lavender fascias on slim posts, posts kept off the driveway.
const walkwayParts = () => {
  const parts: Part[] = [];
  const y = WALKWAY_H;
  const seg = (ax: number, az: number, bx: number, bz: number, w: number) => {
    const L = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bx - ax, bz - az);
    const at = (g: THREE.BufferGeometry, ox: number, oy: number) => g.rotateY(ang).translate((ax + bx) / 2 + Math.cos(ang) * ox, oy, (az + bz) / 2 - Math.sin(ang) * ox);
    parts.push({ g: at(new THREE.BoxGeometry(w, 0.22, L + 0.2), 0, y), c: '#f4f6f8' });
    for (const side of [-1, 1]) parts.push({ g: at(new THREE.BoxGeometry(0.16, 0.45, L + 0.2), (side * w) / 2, y - 0.1), c: K.rim });
  };
  for (const [px, pz] of WALKWAY_POSTS) parts.push(box(px - 0.11, 0, pz - 0.11, px + 0.11, y, pz + 0.11, '#e8eaf2'));
  for (const { pts, w } of WALKWAYS) {
    for (let i = 1; i < pts.length; i++) seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w);
    for (let i = 1; i < pts.length - 1; i++) parts.push(box(pts[i][0] - w / 2, y - 0.11, pts[i][1] - w / 2, pts[i][0] + w / 2, y + 0.11, pts[i][1] + w / 2, '#f4f6f8'));
  }
  return parts;
};

// Window frames + glass as two instanced meshes for every campus window.
function Windows({ wins }: { wins: Win[] }) {
  const frame = useRef<THREE.InstancedMesh>(null!);
  const glass = useRef<THREE.InstancedMesh>(null!);
  const geos = useMemo(() => ({ frame: new THREE.BoxGeometry(1, 1, 0.3).translate(0, 0, 0.08), glass: new THREE.BoxGeometry(1, 1, 0.3).translate(0, 0, 0.03) }), []);
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    wins.forEach((w, i) => {
      o.position.set(w.x, w.y, w.z);
      o.rotation.set(0, w.rot, 0);
      o.scale.set(w.w + 0.32, w.h + 0.32, 1);
      o.updateMatrix();
      frame.current.setMatrixAt(i, o.matrix);
      o.scale.set(w.w, w.h, 1);
      o.updateMatrix();
      glass.current.setMatrixAt(i, o.matrix);
    });
    frame.current.instanceMatrix.needsUpdate = glass.current.instanceMatrix.needsUpdate = true;
    frame.current.computeBoundingSphere();
    glass.current.computeBoundingSphere();
  }, [wins]);
  return (
    <>
      <instancedMesh ref={frame} args={[geos.frame, undefined, wins.length]}>
        <meshStandardMaterial color={K.white} roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={glass} args={[geos.glass, undefined, wins.length]}>
        <meshStandardMaterial color="#2c3344" roughness={0.18} metalness={0.4} />
      </instancedMesh>
    </>
  );
}

function Houses({ shadows }: { shadows: boolean }) {
  const { geos, material } = useCity();
  const ref = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const byModel = useMemo(() => {
    const out: Partial<Record<CityModel, typeof HOUSE_PROPS>> = {};
    for (const h of HOUSE_PROPS) (out[h.model] ??= []).push(h);
    return out;
  }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (const [m, list] of Object.entries(byModel)) {
      const mesh = ref.current[m];
      if (!mesh || !list) continue;
      list.forEach((h, i) => {
        o.position.set(h.x, 0, h.z);
        o.rotation.set(0, h.rot, 0);
        o.scale.setScalar(h.s);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [byModel, geos]);
  return (
    <>
      {CITY_MODELS.filter((m) => byModel[m]).map((m) => (
        <instancedMesh
          key={m}
          ref={(r) => {
            ref.current[m] = r;
          }}
          args={[geos[m], material, byModel[m]!.length]}
          castShadow={shadows}
          receiveShadow={shadows}
        />
      ))}
    </>
  );
}

function NameBoard({ text, at, rot }: { text: string; at: [number, number, number]; rot: number }) {
  const tex = useMemo(() => signTexture([text], { w: 1024, h: 192, size: 92 }), [text]);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={at} rotation-y={rot}>
      <planeGeometry args={[10.6, 2]} />
      <meshStandardMaterial map={tex} roughness={0.5} />
    </mesh>
  );
}

export default function Buildings({ shadows, mobile }: { shadows: boolean; mobile: boolean }) {
  const built = useMemo(() => {
    const parts: Part[] = [];
    const wins: Win[] = [];
    BLOCKS.forEach((b, i) => {
      const r = blockParts(b, 101 + i * 17, true);
      parts.push(...r.parts);
      wins.push(...r.wins);
    });
    BIG_NEIGHBOURS.forEach((b, i) => parts.push(...blockParts(b, 7 + i, false).parts));
    parts.push(...entranceParts(), ...pavilionParts(), ...walkwayParts());
    return { geo: tint(parts), wins };
  }, []);
  useLayoutEffect(() => () => built.geo.dispose(), [built]);
  return (
    <group>
      <mesh geometry={built.geo} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial vertexColors roughness={0.85} />
      </mesh>
      <Windows wins={built.wins} />
      <NameBoard text="JPL BUILDING" at={[-48.5, 9.3, -62.6]} rot={Math.PI} />
      <NameBoard text="COLLEGE OF DENTISTRY" at={[42.5, 7.6, -67.1]} rot={Math.PI} />
      {!mobile && (
        <Suspense fallback={null}>
          <Houses shadows={shadows} />
        </Suspense>
      )}
    </group>
  );
}
