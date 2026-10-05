// Campus buildings extruded from footprints traced off satellite imagery: painted concrete walls, a plinth,
// a sun-shade ledge at every floor, window bands, parapets and roof plant, hipped metal roofs where the imagery
// shows them; plus the covered walkways, the pavilion and the library entrance. The neighbourhood houses are
// plastered boxes under hipped corrugated roofs on their OpenStreetMap footprints.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BLOCKS, COURT, ENTRANCE, ISLAND, PAVILION, PAVILION_POSTS, WALKWAYS, WALKWAY_POSTS, WALKWAY_H, FLOOR_H, HOUSE_LIST, inBlock, inPoly, type Block } from './layout';
import { signTexture } from './signs';
import { weathered } from './materials';

const C = { plinth: '#8f8c86', ledge: '#fbfaf7', parapet: '#e4e0d8', roof: '#d5d4d0', plant: '#bfc3c6', glass: '#2f3a44', white: '#f6f6f3', metal: '#c9ccd0', kerb: '#f2c13a', lawn: '#5e9e5a' };

type Part = { g: THREE.BufferGeometry; c: string };
type XZ = [number, number];
const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string): Part => ({
  g: new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
  c,
});
// A slab running along a facade edge: length along a→b, `out` metres proud of the wall, y0..y1 tall.
const edgeSlab = (a: XZ, b: XZ, n: XZ, out: number, inset: number, y0: number, y1: number, c: string, ext = 0): Part => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) + ext * 2;
  const ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
  const off = (out - inset) / 2;
  const g = new THREE.BoxGeometry(out + inset, y1 - y0, L).rotateY(ang).translate((a[0] + b[0]) / 2 + n[0] * off, (y0 + y1) / 2, (a[1] + b[1]) / 2 + n[1] * off);
  return { g, c };
};
const tint = (parts: Part[]) => {
  const col = new THREE.Color();
  const geos = parts.map(({ g, c }) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (ng !== g) g.dispose();
    for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal') ng.deleteAttribute(k);
    col.set(c);
    const n = ng.getAttribute('position').count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.toArray(arr, i * 3);
    ng.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return ng;
  });
  const merged = mergeGeometries(geos)!;
  geos.forEach((g) => g.dispose());
  return merged;
};
const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const shape = (pts: XZ[]) => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
// Footprint extruded upwards from y0 to y1.
const prism = (pts: XZ[], y0: number, y1: number, c: string): Part => ({
  g: new THREE.ExtrudeGeometry(shape(pts), { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y0, 0),
  c,
});
// Hipped roof over a rectangle: ridge along the long side, eaves overhanging by `o`.
const hipRoof = (x0: number, z0: number, x1: number, z1: number, y: number, h: number, o: number, c: string): Part => {
  [x0, z0, x1, z1] = [x0 - o, z0 - o, x1 + o, z1 + o];
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const half = Math.max(0, Math.abs(d - w) / 2);
  const [r0, r1]: [number, number, number][] = d >= w ? [[cx, y + h, cz - half], [cx, y + h, cz + half]] : [[cx - half, y + h, cz], [cx + half, y + h, cz]];
  const A: [number, number, number] = [x0, y, z0];
  const B: [number, number, number] = [x1, y, z0];
  const Cc: [number, number, number] = [x1, y, z1];
  const D: [number, number, number] = [x0, y, z1];
  const tris = d >= w ? [A, r0, B, B, r0, r1, B, r1, Cc, Cc, r1, D, D, r1, r0, D, r0, A] : [A, r0, D, D, r0, r1, D, r1, Cc, Cc, r1, B, B, r1, r0, B, r0, A];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals();
  if (g.getAttribute('normal').getY(0) < 0) {
    for (let i = 0; i < tris.length; i += 3) [tris[i + 1], tris[i + 2]] = [tris[i + 2], tris[i + 1]];
    g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
    g.computeVertexNormals();
  }
  return { g, c };
};
// Edges with their outward normal.
const edges = (pts: XZ[]) =>
  pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t: XZ = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    let n: XZ = [t[1], -t[0]];
    const m: XZ = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (inPoly(pts, m[0] + n[0] * 0.3, m[1] + n[1] * 0.3)) n = [-n[0], -n[1]];
    return { a, b, t, n, L };
  });

type Win = { x: number; y: number; z: number; rot: number; w: number; h: number };
// The covered court: concrete floor, two painted courts with hoops, bleachers, columns, a deep-fascia roof.
function courtParts(b: Block) {
  const { x0, x1, z0, z1, columns, courts, bleachers, H } = COURT;
  const parts: Part[] = [prism(b.pts, 0, 0.1, '#bdb7ab')];
  const line = '#f4f2ea';
  for (const [cx, cz] of courts) {
    const [hw, hl] = [7.5, 14];
    parts.push(box(cx - hw - 1, 0.1, cz - hl - 1, cx + hw + 1, 0.13, cz + hl + 1, '#4f8a64'));
    for (const e of [-1, 1]) {
      parts.push(box(cx - hw, 0.13, cz + e * hl - 0.05, cx + hw, 0.15, cz + e * hl + 0.05, line)); // end lines
      parts.push(box(cx + e * hw - 0.05, 0.13, cz - hl, cx + e * hw + 0.05, 0.15, cz + hl, line)); // side lines
      const kz = cz + e * hl;
      parts.push(box(cx - 2.45, 0.13, Math.min(kz, kz - e * 5.8), cx + 2.45, 0.145, Math.max(kz, kz - e * 5.8), '#a9553a')); // key
      // hoop: post behind the end line, backboard, rim
      parts.push(box(cx - 0.12, 0, kz + e * 1.6 - 0.12, cx + 0.12, 3.3, kz + e * 1.6 + 0.12, '#3b4046'));
      parts.push(box(cx - 0.9, 2.9, kz + e * 1.2 - 0.03, cx + 0.9, 3.95, kz + e * 1.2 + 0.03, '#f6f6f3'));
      parts.push(box(cx - 0.25, 3.03, kz + e * 0.75 - 0.25, cx + 0.25, 3.07, kz + e * 0.75 + 0.25, '#e0702a'));
    }
    parts.push(box(cx - hw, 0.13, cz - 0.05, cx + hw, 0.15, cz + 0.05, line)); // centre line
    parts.push({ g: new THREE.RingGeometry(1.75, 1.85, 40).rotateX(-Math.PI / 2).translate(cx, 0.15, cz), c: line });
  }
  for (const [bx0, bx1, bz0, bz1] of bleachers) {
    const toCourt = bx0 > (x0 + x1) / 2 ? -1 : 1; // steps rise away from the courts
    for (let k = 0; k < 4; k++) {
      const w = (bx1 - bx0) / 4;
      const sx = toCourt > 0 ? bx1 - (k + 1) * w : bx0 + k * w;
      parts.push(box(sx, 0, bz0, sx + w, 0.5 + k * 0.45, bz1, '#cfcac0'));
    }
  }
  for (const [cx, cz] of columns) parts.push(box(cx - 0.35, 0, cz - 0.35, cx + 0.35, H, cz + 0.35, C.parapet));
  parts.push(prism(b.pts, H, H + 0.35, b.roofColor ?? C.roof));
  for (const e of edges(b.pts)) parts.push(edgeSlab(e.a, e.b, e.n, 0.35, 0.25, H - 1.3, H + 0.75, '#f1f0ec', 0.35));
  for (let z = z0 + 4; z < z1 - 3; z += 6.2)
    for (const fx of [0.3, 0.7]) {
      const x = x0 + (x1 - x0) * fx;
      parts.push(box(x - 1.3, H + 0.35, z - 1.3, x + 1.3, H + 0.9, z + 1.3, C.glass));
    }
  return parts;
}

function blockParts(b: Block, seed: number) {
  const parts: Part[] = [];
  const wins: Win[] = [];
  if (b.roof === 'court') return { parts: courtParts(b), wins };
  const H = b.floors * FLOOR_H;
  const xs = b.pts.map((p) => p[0]);
  const zs = b.pts.map((p) => p[1]);
  const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  parts.push(prism(b.pts, 0, H, b.wall));
  const E = edges(b.pts);
  // a facade point is hidden when another block sits right against it
  const hidden = (x: number, z: number, n: XZ) => inBlock(x + n[0] * 0.8, z + n[1] * 0.8);
  for (const e of E) {
    const mid: XZ = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2];
    if (hidden(mid[0], mid[1], e.n) && e.L < 30) continue;
    parts.push(edgeSlab(e.a, e.b, e.n, 0.14, 0, 0, 0.9, C.plinth, 0.14));
    for (let f = 1; f < b.floors; f++) parts.push(edgeSlab(e.a, e.b, e.n, 0.75, 0, f * FLOOR_H - 0.16, f * FLOOR_H, C.ledge, 0.75));
    // windows: a glazed band per floor split by mullions every ~3 m
    const step = b.roof === 'skylights' ? 4.4 : 3;
    const n = Math.floor((e.L - 1.6) / step);
    if (n < 1) continue;
    const pad = (e.L - n * step) / 2;
    const rot = Math.atan2(e.n[0], e.n[1]);
    for (let i = 0; i < n; i++) {
      const along = pad + step * (i + 0.5);
      const x = e.a[0] + e.t[0] * along;
      const z = e.a[1] + e.t[1] * along;
      if (hidden(x, z, e.n)) continue;
      for (let f = 0; f < b.floors; f++) wins.push({ x, y: f * FLOOR_H + 1.75, z, rot, w: step - 0.45, h: f === 0 ? 2 : 1.75 });
    }
  }
  if (b.roof === 'hip') {
    parts.push(hipRoof(x0, z0, x1, z1, H, Math.min(x1 - x0, z1 - z0) * 0.22, 0.7, b.roofColor ?? C.roof));
  } else {
    parts.push(prism(b.pts, H, H + 0.12, b.roofColor ?? C.roof));
    for (const e of E) parts.push(edgeSlab(e.a, e.b, e.n, 0.15, 0.3, H, H + 0.95, C.parapet, 0.15));
    const r = rand(seed);
    const area = (x1 - x0) * (z1 - z0);
    if (b.roof === 'skylights') {
      for (let z = z0 + 4; z < z1 - 3; z += 6.2)
        for (const fx of [0.3, 0.7]) {
          const x = x0 + (x1 - x0) * fx;
          parts.push(box(x - 1.3, H + 0.12, z - 1.3, x + 1.3, H + 0.75, z + 1.3, C.glass));
        }
    }
    // roof plant: condensers, water tanks, stair heads
    for (let i = 0; i < Math.round(area / 300) + 1; i++) {
      const cx = x0 + 2.5 + r() * (x1 - x0 - 5);
      const cz = z0 + 2.5 + r() * (z1 - z0 - 5);
      if (!inPoly(b.pts, cx, cz) || (b.roof === 'skylights' && Math.abs(cx - (x0 + x1) / 2) < (x1 - x0) * 0.42)) continue;
      const k = r();
      if (k < 0.5) parts.push(box(cx - 0.9, H + 0.12, cz - 0.6, cx + 0.9, H + 1.1, cz + 0.6, C.plant));
      else if (k < 0.75) parts.push({ g: new THREE.CylinderGeometry(0.9, 0.9, 1.6, 12).translate(cx, H + 0.92, cz), c: '#3d5a80' });
      else parts.push(box(cx - 1.8, H + 0.12, cz - 1.5, cx + 1.8, H + 2.6, cz + 1.5, b.wall));
    }
  }
  // balcony slabs + rails along one facade run (the JPL west wing over the avenue)
  if (b.rails) {
    const { a, b: bb, out, color } = b.rails;
    for (let f = 1; f < b.floors; f++) {
      parts.push(edgeSlab(a, bb, out, 1.4, 0, f * FLOOR_H - 0.2, f * FLOOR_H + 0.05, C.ledge));
      const ao: XZ = [a[0] + out[0] * 1.35, a[1] + out[1] * 1.35];
      const bo: XZ = [bb[0] + out[0] * 1.35, bb[1] + out[1] * 1.35];
      parts.push(edgeSlab(ao, bo, out, 0.1, 0, f * FLOOR_H + 0.05, f * FLOOR_H + 1.05, color));
    }
  }
  return { parts, wins };
}

const entranceParts = () => {
  const { x, z, w, d } = ENTRANCE;
  const parts: Part[] = [box(x - w / 2, 4.1, z - d / 2, x + w / 2, 4.5, z + d / 2, C.white)];
  for (const pz of [z - d / 2 + 0.4, z + d / 2 - 0.4]) parts.push(box(x - w / 2 + 0.2, 0, pz - 0.2, x - w / 2 + 0.6, 4.1, pz + 0.2, C.metal));
  parts.push(box(x + w / 2 - 0.1, 0, z - 2.4, x + w / 2 + 0.05, 2.8, z + 2.4, C.glass));
  // the lawn island's yellow kerb, with three flagpoles at its south end
  const [ix0, ix1, iz0, iz1] = ISLAND;
  parts.push(box(ix0, 0, iz0, ix1, 0.25, iz1, C.kerb), box(ix0 + 0.3, 0.25, iz0 + 0.3, ix1 - 0.3, 0.32, iz1 - 0.3, C.lawn));
  for (let i = 0; i < 3; i++) {
    const fz = iz1 - 2.6 + i * 1;
    parts.push(box(ix1 - 1.1, 0, fz - 0.06, ix1 - 0.98, 9, fz + 0.06, C.white));
    parts.push(box(ix1 - 0.98, 7.6, fz - 0.03, ix1 + 0.6, 8.6, fz + 0.03, ['#c8102e', '#1d4e9e', '#e2b23c'][i]));
  }
  return parts;
};

// Open pavilion inside the loop: white posts under a low white hipped roof (white in the imagery).
const pavilionParts = () => {
  const { x, z, w, d } = PAVILION;
  const parts: Part[] = [box(x - w / 2, 0, z - d / 2, x + w / 2, 0.2, z + d / 2, '#cfcbc3')];
  for (const [px, pz] of PAVILION_POSTS) parts.push(box(px - 0.2, 0.2, pz - 0.2, px + 0.2, 3.2, pz + 0.2, C.white));
  parts.push(box(x - w / 2 - 0.4, 3.2, z - d / 2 - 0.4, x + w / 2 + 0.4, 3.5, z + d / 2 + 0.4, C.parapet));
  parts.push(hipRoof(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 3.5, 1.6, 0.4, '#eceeee'));
  return parts;
};

// Covered walkways: a white roof slab with fascias on slim posts, posts kept off the driveway.
const walkwayParts = () => {
  const parts: Part[] = [];
  const y = WALKWAY_H;
  const seg = (ax: number, az: number, bx: number, bz: number, w: number) => {
    const L = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bx - ax, bz - az);
    const at = (g: THREE.BufferGeometry, ox: number, oy: number) => g.rotateY(ang).translate((ax + bx) / 2 + Math.cos(ang) * ox, oy, (az + bz) / 2 - Math.sin(ang) * ox);
    parts.push({ g: at(new THREE.BoxGeometry(w, 0.22, L + 0.2), 0, y), c: '#f1f2f0' });
    for (const side of [-1, 1]) parts.push({ g: at(new THREE.BoxGeometry(0.16, 0.45, L + 0.2), (side * w) / 2, y - 0.1), c: C.metal });
  };
  for (const [px, pz] of WALKWAY_POSTS) parts.push(box(px - 0.11, 0, pz - 0.11, px + 0.11, y, pz + 0.11, '#e3e3df'));
  for (const { pts, w } of WALKWAYS) {
    for (let i = 1; i < pts.length; i++) seg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w);
    for (let i = 1; i < pts.length - 1; i++) parts.push(box(pts[i][0] - w / 2, y - 0.11, pts[i][1] - w / 2, pts[i][0] + w / 2, y + 0.11, pts[i][1] + w / 2, '#f1f2f0'));
  }
  return parts;
};

// Window frames + glass as two instanced meshes for every campus window.
function Windows({ wins }: { wins: Win[] }) {
  const frame = useRef<THREE.InstancedMesh>(null!);
  const glass = useRef<THREE.InstancedMesh>(null!);
  const geos = useMemo(() => ({ frame: new THREE.BoxGeometry(1, 1, 0.2).translate(0, 0, 0.06), glass: new THREE.BoxGeometry(1, 1, 0.2).translate(0, 0, 0.02) }), []);
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    wins.forEach((w, i) => {
      o.position.set(w.x, w.y, w.z);
      o.rotation.set(0, w.rot, 0);
      o.scale.set(w.w + 0.22, w.h + 0.22, 1);
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
        <meshStandardMaterial color="#d9d7d1" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={glass} args={[geos.glass, undefined, wins.length]}>
        <meshStandardMaterial color={C.glass} roughness={0.15} metalness={0.55} envMapIntensity={1.4} />
      </instancedMesh>
    </>
  );
}

// Neighbourhood houses: one instanced wall box and one instanced hipped roof, coloured per house.
function Houses({ shadows }: { shadows: boolean }) {
  const walls = useRef<THREE.InstancedMesh>(null!);
  const roofs = useRef<THREE.InstancedMesh>(null!);
  const geos = useMemo(
    () => ({
      wall: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      roof: new THREE.CylinderGeometry(0.16, 0.74, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0),
    }),
    [],
  );
  const mats = useMemo(() => ({ wall: weathered(new THREE.MeshStandardMaterial({ roughness: 0.9 }), 0.16), roof: weathered(new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.15, flatShading: true }), 0.22) }), []);
  useLayoutEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geos, mats],
  );
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    HOUSE_LIST.forEach((h, i) => {
      o.position.set(h.x, 0, h.z);
      o.rotation.set(0, h.yaw, 0);
      o.scale.set(h.w, h.h, h.d);
      o.updateMatrix();
      walls.current.setMatrixAt(i, o.matrix);
      walls.current.setColorAt(i, col.set(h.wall));
      o.position.y = h.h;
      o.scale.set(h.w * 1.1, Math.min(h.w, h.d) * 0.3, h.d * 1.1);
      o.updateMatrix();
      roofs.current.setMatrixAt(i, o.matrix);
      roofs.current.setColorAt(i, col.set(h.roof));
    });
    for (const m of [walls.current, roofs.current]) {
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor!.needsUpdate = true;
      m.computeBoundingSphere();
    }
  }, []);
  return (
    <>
      <instancedMesh ref={walls} args={[geos.wall, mats.wall, HOUSE_LIST.length]} castShadow={shadows} receiveShadow={shadows} />
      <instancedMesh ref={roofs} args={[geos.roof, mats.roof, HOUSE_LIST.length]} castShadow={shadows} receiveShadow={shadows} />
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

export default function Buildings({ shadows }: { shadows: boolean }) {
  const built = useMemo(() => {
    const parts: Part[] = [];
    const wins: Win[] = [];
    BLOCKS.forEach((b, i) => {
      const r = blockParts(b, 101 + i * 17);
      parts.push(...r.parts);
      wins.push(...r.wins);
    });
    parts.push(...entranceParts(), ...pavilionParts(), ...walkwayParts());
    return { geo: tint(parts), wins };
  }, []);
  const mat = useMemo(() => weathered(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 }), 0.12), []);
  useLayoutEffect(
    () => () => {
      built.geo.dispose();
      mat.dispose();
    },
    [built, mat],
  );
  return (
    <group>
      <mesh geometry={built.geo} material={mat} castShadow={shadows} receiveShadow={shadows} />
      <Windows wins={built.wins} />
      <NameBoard text="JPL BUILDING" at={[-48, 9.3, -62.25]} rot={Math.PI} />
      <NameBoard text="COLLEGE OF DENTISTRY" at={[42.5, 7.6, -67.45]} rot={Math.PI} />
      <Houses shadows={shadows} />
    </group>
  );
}
