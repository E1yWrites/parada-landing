// The campus canopy: broad rain trees and acacias built once as a lumpy crown on a trunk, instanced at every grove
// spot with its own size, turn and leaf tone; one flame tree flowers red in the south courtyard. Palms line the
// library entrance.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TREES, PALMS } from './layout';
import { weathered } from './materials';

const LEAF = ['#3f7a3a', '#4a8740', '#376d35', '#55913f', '#2f6631'];
const FLAME = '#d4452b';

// One tree, canopy diameter 1: a trunk and a crown of displaced blobs, darker underneath.
function treeGeometry(detail: number) {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.022, 0.04, 0.42, 7).translate(0, 0.21, 0);
  const blobs: [number, number, number, number][] = [
    [0, 0.5, 0, 0.3], [0.22, 0.46, 0.06, 0.22], [-0.2, 0.47, -0.08, 0.24], [0.05, 0.47, 0.22, 0.21], [-0.06, 0.46, -0.23, 0.2], [0.02, 0.6, 0.02, 0.2],
  ];
  const col = new THREE.Color();
  const paint = (g: THREE.BufferGeometry, f: (y: number) => THREE.Color) => {
    const p = g.getAttribute('position');
    const c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) f(p.getY(i)).toArray(c, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  };
  paint(trunk, () => col.set('#6b5644'));
  trunk.deleteAttribute('uv');
  parts.push(trunk);
  for (const [x, y, z, r] of blobs) {
    const ico = new THREE.IcosahedronGeometry(r, detail);
    ico.deleteAttribute('normal');
    ico.deleteAttribute('uv');
    const g = mergeVertices(ico); // shared vertices, so the crown shades smooth
    ico.dispose();
    const p = g.getAttribute('position');
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i);
      const vy = p.getY(i);
      const vz = p.getZ(i);
      const k = 1 + 0.16 * Math.sin(vx * 23 + vz * 17) * Math.cos(vy * 19 + vx * 7);
      p.setXYZ(i, vx * k + x, vy * k * 0.62 + y, vz * k + z);
    }
    g.computeVertexNormals();
    paint(g, (vy) => col.setScalar(0.62 + Math.min(1, Math.max(0, (vy - 0.36) / 0.32)) * 0.45));
    parts.push(g);
  }
  const merged = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))!;
  if (merged.getAttribute('uv')) merged.deleteAttribute('uv');
  return merged;
}

export default function Trees({ shadows, mobile }: { shadows: boolean; mobile: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const palmTrunks = useRef<THREE.InstancedMesh>(null!);
  const fronds = useRef<THREE.InstancedMesh>(null!);
  const geo = useMemo(() => treeGeometry(mobile ? 1 : 2), [mobile]);
  const palm = useMemo(() => ({ trunk: new THREE.CylinderGeometry(0.16, 0.28, 8, 7).translate(0, 4, 0), frond: new THREE.ConeGeometry(0.55, 4, 3, 1).rotateX(Math.PI / 2).scale(1, 0.18, 1).translate(0, 0, 2) }), []);
  const mat = useMemo(() => weathered(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), 0.22, 1.2), []);
  useLayoutEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
      Object.values(palm).forEach((g) => g.dispose());
    },
    [geo, mat, palm],
  );
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    TREES.forEach(([x, z, s, kind], i) => {
      const h = Math.abs(Math.sin(x * 3.1 + z * 1.7));
      o.position.set(x, 0, z);
      o.rotation.set(0, h * Math.PI * 2, 0);
      o.scale.set(s, s * (0.85 + h * 0.3), s);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
      ref.current.setColorAt(i, col.set(kind === 1 ? FLAME : LEAF[Math.floor(h * LEAF.length) % LEAF.length]));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor!.needsUpdate = true;
    ref.current.computeBoundingSphere();
    PALMS.forEach(([x, z, s], i) => {
      o.position.set(x, 0.3, z);
      o.rotation.set(0.05 * ((i % 3) - 1), 0, 0.05);
      o.scale.setScalar(s);
      o.updateMatrix();
      palmTrunks.current.setMatrixAt(i, o.matrix);
      for (let k = 0; k < 8; k++) {
        o.position.set(x, 8 * s + 0.3, z);
        o.rotation.set(0.35 + (k % 2) * 0.3, (k / 8) * Math.PI * 2 + i, 0, 'YXZ');
        o.updateMatrix();
        fronds.current.setMatrixAt(i * 8 + k, o.matrix);
        fronds.current.setColorAt(i * 8 + k, col.set(k % 2 ? '#4f9a3c' : '#3d8433'));
      }
    });
    for (const m of [palmTrunks.current, fronds.current]) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.computeBoundingSphere();
    }
  }, [geo]);
  return (
    <>
      <instancedMesh ref={ref} args={[geo, mat, TREES.length]} castShadow={shadows} receiveShadow={shadows} />
      <instancedMesh ref={palmTrunks} args={[palm.trunk, undefined, PALMS.length]} castShadow={shadows}>
        <meshStandardMaterial color="#8a7458" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={fronds} args={[palm.frond, undefined, PALMS.length * 8]} castShadow={shadows}>
        <meshStandardMaterial roughness={0.9} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}
