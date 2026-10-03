// Grey-box campus lot: ground, road, three zones with slot lines and parked cars, gates.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { zoneLayout, takenSlots, SLOT_W, SLOT_D, ZONE_W, ROAD_Z } from './layout';

const tmp = new THREE.Object3D();

function Instances({ transforms, geo, color, shadows }: { transforms: [number, number, number, number][]; geo: THREE.BufferGeometry; color: string; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    transforms.forEach(([x, y, z, ry], i) => {
      tmp.position.set(x, y, z);
      tmp.rotation.set(0, ry, 0);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [transforms]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, transforms.length]} castShadow={shadows} receiveShadow={shadows}>
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
}

export default function Lot({ shadows }: { shadows: boolean }) {
  const geos = useMemo(
    () => ({
      line: new THREE.BoxGeometry(0.12, 0.02, SLOT_D),
      car: new THREE.BoxGeometry(1.8, 1.3, 4.2),
    }),
    [],
  );
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  const { lines, cars } = useMemo(() => {
    const lines: [number, number, number, number][] = [];
    const cars: [number, number, number, number][] = [];
    zoneLayout.forEach((z, zi) => {
      z.slots.forEach(([x, sz], i) => {
        lines.push([x - SLOT_W / 2, 0.02, sz, 0]);
        if (i % 10 === 9) lines.push([x + SLOT_W / 2, 0.02, sz, 0]);
      });
      takenSlots(z.capacity, z.occupied, 7 + zi).forEach((i) => {
        const [x, sz] = z.slots[i];
        cars.push([x, 0.65, sz, 0]);
      });
    });
    return { lines, cars };
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -10]} receiveShadow={shadows}>
        <planeGeometry args={[220, 160]} />
        <meshStandardMaterial color="#1a1f27" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, ROAD_Z]} receiveShadow={shadows}>
        <planeGeometry args={[150, 9]} />
        <meshStandardMaterial color="#232a34" roughness={1} />
      </mesh>

      {zoneLayout.map((z) => (
        <group key={z.code}>
          <mesh rotation-x={-Math.PI / 2} position={[z.x, 0.005, z.centerZ]} receiveShadow={shadows}>
            <planeGeometry args={[ZONE_W + 2, z.depth]} />
            <meshStandardMaterial color="#2b323d" roughness={1} />
          </mesh>
          {/* gate: two posts, boom, camera pole */}
          <mesh position={[z.gate[0] - 3, 0.6, z.gate[2]]} castShadow={shadows}>
            <boxGeometry args={[0.5, 1.2, 0.5]} />
            <meshStandardMaterial color="#5b6472" />
          </mesh>
          <mesh position={[z.gate[0] - 0.4, 1.1, z.gate[2]]} castShadow={shadows}>
            <boxGeometry args={[5.2, 0.15, 0.15]} />
            <meshStandardMaterial color="#8d97a6" />
          </mesh>
          <mesh position={[z.gate[0] + 3.2, 2, z.gate[2] + 0.4]} castShadow={shadows}>
            <boxGeometry args={[0.2, 4, 0.2]} />
            <meshStandardMaterial color="#5b6472" />
          </mesh>
          <mesh position={[z.gate[0] + 2.8, 4, z.gate[2] + 0.4]}>
            <boxGeometry args={[0.9, 0.45, 0.45]} />
            <meshStandardMaterial color="#8d97a6" />
          </mesh>
          <Html position={[z.x, 6, z.centerZ]} center zIndexRange={[1, 0]} className="zone-tag">
            <b>{z.name}</b>
            <span>
              {z.occupied} / {z.capacity}
            </span>
          </Html>
        </group>
      ))}

      <Instances transforms={lines} geo={geos.line} color="#c9d1dc" shadows={false} />
      <Instances transforms={cars} geo={geos.car} color="#77808e" shadows={shadows} />

      {/* campus buildings, grey boxes */}
      {[
        [-50, -52, 22, 14, 10],
        [-18, -56, 18, 8, 12],
        [16, -54, 26, 18, 10],
        [52, -48, 14, 10, 14],
      ].map(([x, z, w, h, d]) => (
        <mesh key={`${x}${z}`} position={[x, h / 2, z]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#3a424e" />
        </mesh>
      ))}
    </group>
  );
}
