// The two gates in the street wall. ENTRY (photo 1): curved white canopy on stone pillars, guard booth,
// boom barrier, plate camera. EXIT (photo 8): steel carport roof, sliding gate, plate camera.
// Moving parts read `gates` every frame; the scroll pipeline or drive mode writes it.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ENTRY, EXIT, ROAD_W } from './layout';
import { gates } from './state';
import { signTexture } from './signs';

export const ENTRY_CAM = new THREE.Vector3(ENTRY.x + 4.4, 3.8, ENTRY.z - 0.6);
export const ENTRY_PLATE = new THREE.Vector3(ENTRY.x, 0.6, ENTRY.z + 2.3); // front plate of a car waiting at the entry
export const EXIT_CAM = new THREE.Vector3(EXIT.x - 4.6, 3.8, EXIT.z + 0.8);
export const EXIT_PLATE = new THREE.Vector3(EXIT.x, 0.6, EXIT.z - 2.3);
const BOOM_LEN = ROAD_W - 0.4;

const cone = (from: THREE.Vector3, to: THREE.Vector3) => {
  const len = from.distanceTo(to);
  return new THREE.ConeGeometry(1.4, len, 24, 1, true).translate(0, -len / 2, 0).rotateX(-Math.PI / 2);
};

function Mat({ c, r = 0.8, m = 0 }: { c: string; r?: number; m?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} />;
}

function Camera({ at, target }: { at: THREE.Vector3; target: THREE.Vector3 }) {
  const head = useRef<THREE.Group>(null!);
  useEffect(() => head.current.lookAt(target), [target]);
  return (
    <>
      <mesh position={[at.x, at.y / 2, at.z]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, at.y, 8]} />
        <Mat c="#3a3f46" m={0.4} r={0.5} />
      </mesh>
      <group ref={head} position={at}>
        <mesh>
          <boxGeometry args={[0.42, 0.36, 0.8]} />
          <Mat c="#f2f2ee" r={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <circleGeometry args={[0.13, 16]} />
          <meshBasicMaterial color="#10141a" />
        </mesh>
      </group>
    </>
  );
}

export default function Gates({ shadows }: { shadows: boolean }) {
  const res = useMemo(
    () => ({
      entryCone: cone(ENTRY_CAM, ENTRY_PLATE),
      exitCone: cone(EXIT_CAM, EXIT_PLATE),
      canopy: new THREE.CylinderGeometry(12, 12, 7, 40, 1, true, -0.74, 1.48).rotateX(-Math.PI / 2),
      entrySign: signTexture(['ENTRY'], { size: 120 }),
      exitSign: signTexture(['EXIT'], { size: 120, bg: '#d22b2b', shade: '#12297d' }),
    }),
    [],
  );
  useEffect(() => () => Object.values(res).forEach((r) => r.dispose()), [res]);

  const boom = useRef<THREE.Group>(null!);
  const slide = useRef<THREE.Group>(null!);
  const eCone = useRef<THREE.Mesh>(null!);
  const xCone = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    boom.current.rotation.z = -gates.entryBoom * 1.42;
    slide.current.position.x = gates.exitSlide * (ROAD_W + 0.6);
    (eCone.current.material as THREE.MeshBasicMaterial).opacity = gates.entryCone * 0.3;
    eCone.current.visible = gates.entryCone > 0.01;
    (xCone.current.material as THREE.MeshBasicMaterial).opacity = gates.exitCone * 0.3;
    xCone.current.visible = gates.exitCone > 0.01;
  });

  return (
    <group>
      {/* ENTRY */}
      <group position={[ENTRY.x, 0, ENTRY.z]}>
        {[-5.4, 5.4].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 2.5, 0]} castShadow={shadows}>
              <boxGeometry args={[1.7, 5, 1.9]} />
              <Mat c="#8d755a" r={0.95} />
            </mesh>
            {[1, 2.4, 3.8].map((y) => (
              <mesh key={y} position={[0, y, 0]}>
                <boxGeometry args={[1.76, 0.12, 1.96]} />
                <Mat c="#6b5845" />
              </mesh>
            ))}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[2.3, 0.3, 2.5]} />
              <Mat c="#f6c31c" r={0.6} />
            </mesh>
          </group>
        ))}
        <mesh geometry={res.canopy} position={[0, -5.5, 0]} castShadow={shadows}>
          <meshStandardMaterial color="#f4f3ee" roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 7.75, 3.55]}>
          <planeGeometry args={[6.4, 3.2]} />
          <meshStandardMaterial map={res.entrySign} roughness={0.5} />
        </mesh>
        {/* guard booth */}
        <group position={[-9.2, 0, 2.4]}>
          <mesh position={[0, 1.4, 0]} castShadow={shadows}>
            <boxGeometry args={[3, 2.8, 2.8]} />
            <Mat c="#efe9dc" />
          </mesh>
          <mesh position={[0, 2.95, 0]} castShadow={shadows}>
            <boxGeometry args={[3.6, 0.25, 3.4]} />
            <Mat c="#2f7a4c" />
          </mesh>
          <mesh position={[1.51, 1.7, 0]} rotation-y={Math.PI / 2}>
            <planeGeometry args={[2, 1.1]} />
            <Mat c="#22313d" r={0.2} m={0.3} />
          </mesh>
        </group>
        {/* boom barrier: pivot on the east kerb, arm across the lane */}
        <mesh position={[ROAD_W / 2 + 0.3, 0.55, 1.2]} castShadow={shadows}>
          <boxGeometry args={[0.6, 1.1, 0.6]} />
          <Mat c="#f6c31c" r={0.6} />
        </mesh>
        <group ref={boom} position={[ROAD_W / 2 + 0.3, 1.05, 1.2]}>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[-(i + 0.5) * (BOOM_LEN / 6), 0, 0]}>
              <boxGeometry args={[BOOM_LEN / 6, 0.14, 0.14]} />
              <Mat c={i % 2 ? '#f7f7f2' : '#d22b2b'} r={0.5} />
            </mesh>
          ))}
        </group>
      </group>
      <Camera at={ENTRY_CAM} target={ENTRY_PLATE} />
      <mesh ref={eCone} geometry={res.entryCone} position={ENTRY_CAM} onUpdate={(m) => m.lookAt(ENTRY_PLATE)}>
        <meshBasicMaterial color="#f6c31c" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* EXIT */}
      <group position={[EXIT.x, 0, EXIT.z]}>
        {[
          [-5, -3.5], [5, -3.5], [-5, 3.5], [5, 3.5],
        ].map(([x, z]) => (
          <mesh key={`${x},${z}`} position={[x, 2.4, z]} castShadow={shadows}>
            <boxGeometry args={[0.28, 4.8, 0.28]} />
            <Mat c="#d9dde2" m={0.5} r={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 4.95, 0]} rotation-x={0.06} castShadow={shadows}>
          <boxGeometry args={[12, 0.22, 8.4]} />
          <Mat c="#eef0f2" m={0.3} r={0.5} />
        </mesh>
        <mesh position={[0, 6.6, 0]}>
          <planeGeometry args={[6.4, 3.2]} />
          <meshStandardMaterial map={res.exitSign} roughness={0.5} />
        </mesh>
        <mesh position={[0, 6.6, -0.02]} rotation-y={Math.PI}>
          <planeGeometry args={[6.4, 3.2]} />
          <meshStandardMaterial map={res.exitSign} roughness={0.5} />
        </mesh>
        {/* sliding gate: white bar frame, rolls east */}
        <group ref={slide} position={[0, 0, 0.6]}>
          {[0.25, 1.85].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[ROAD_W, 0.12, 0.12]} />
              <Mat c="#f7f7f2" m={0.3} r={0.4} />
            </mesh>
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[-ROAD_W / 2 + (i + 0.5) * (ROAD_W / 10), 1.05, 0]}>
              <boxGeometry args={[0.07, 1.6, 0.07]} />
              <Mat c="#f7f7f2" m={0.3} r={0.4} />
            </mesh>
          ))}
        </group>
      </group>
      <Camera at={EXIT_CAM} target={EXIT_PLATE} />
      <mesh ref={xCone} geometry={res.exitCone} position={EXIT_CAM} onUpdate={(m) => m.lookAt(EXIT_PLATE)}>
        <meshBasicMaterial color="#f6c31c" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
