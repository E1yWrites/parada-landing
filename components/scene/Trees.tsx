// The campus canopy: broad rain trees (the CC0 acacia from props.glb, spread round and flattened) instanced at every
// grove spot with its own size, turn and leaf tone; one flame tree flowers red in the south courtyard. Palms line the
// library entrance.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TREES, PALMS } from './layout';
import { weathered } from './materials';
import { useProps } from './kit';

const LEAF = ['#3f7a3a', '#4a8740', '#376d35', '#55913f', '#2f6631'];
const FLAME = '#d4452b';

export default function Trees({ shadows }: { shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const trunks = useRef<THREE.InstancedMesh>(null!);
  const palmTrunks = useRef<THREE.InstancedMesh>(null!);
  const fronds = useRef<THREE.InstancedMesh>(null!);
  const { tree } = useProps();
  const palm = useMemo(() => ({ trunk: new THREE.CylinderGeometry(0.16, 0.28, 8, 7).translate(0, 4, 0), frond: new THREE.ConeGeometry(0.55, 4, 3, 1).rotateX(Math.PI / 2).scale(1, 0.18, 1).translate(0, 0, 2) }), []);
  const mat = useMemo(() => weathered(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), 0.22, 1.2), []);
  useLayoutEffect(
    () => () => {
      mat.dispose();
      Object.values(palm).forEach((g) => g.dispose());
    },
    [mat, palm],
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
      trunks.current.setMatrixAt(i, o.matrix);
      ref.current.setColorAt(i, col.set(kind === 1 ? FLAME : LEAF[Math.floor(h * LEAF.length) % LEAF.length]));
    });
    ref.current.instanceMatrix.needsUpdate = trunks.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor!.needsUpdate = true;
    ref.current.computeBoundingSphere();
    trunks.current.computeBoundingSphere();
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
  }, [tree]);
  return (
    <>
      <instancedMesh ref={ref} args={[tree.crown, mat, TREES.length]} castShadow={shadows} receiveShadow={shadows} />
      <instancedMesh ref={trunks} args={[tree.trunk, mat, TREES.length]} castShadow={shadows} />
      <instancedMesh ref={palmTrunks} args={[palm.trunk, undefined, PALMS.length]} castShadow={shadows}>
        <meshStandardMaterial color="#8a7458" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={fronds} args={[palm.frond, undefined, PALMS.length * 8]} castShadow={shadows}>
        <meshStandardMaterial roughness={0.9} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}
