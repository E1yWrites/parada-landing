// The four PARADA gate cameras. Zone A (the Main Loop): the main gate under the corner canopy (photo 1) is its
// entry camera; the north gate on Doña Aurelia St (photo 8: steel pergola) is its exit camera. Zones B and C: a
// gantry over each lot's mouth, one camera both ways.
// Each gate is built in a local frame where a car drives INTO the zone along +z, then turned to `inward`.
// Moving parts read `gates` every frame; the scroll tour or drive mode writes it.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GATE_LIST, GATE_STOP, ROAD_W, CANOPY, CANOPY_PILLARS, CANOPY_PLANTERS, CANOPY_BOOTH, type Gate } from './layout';
import { gates } from './state';
import { signTexture } from './signs';

const BOOM_LEN = ROAD_W - 0.3;

/** World positions for a gate: camera head, and the front plate of a car waiting outside / inside. */
export function gateFrame(g: Gate) {
  const c = Math.cos(g.inward);
  const s = Math.sin(g.inward);
  const at = (lx: number, ly: number, lz: number) => new THREE.Vector3(g.x + lx * c + lz * s, ly, g.z - lx * s + lz * c);
  const camLocal: [number, number, number] = g.style === 'gantry' ? [0, 5.4, 0] : g.style === 'canopy' ? [ROAD_W / 2 + 0.2, 5.1, 0.6] : [-(ROAD_W / 2 + 1.2), 4.2, 0.8];
  return {
    at,
    cam: at(...camLocal),
    camLocal,
    entryPlate: at(0, 0.62, -GATE_STOP + 2.17),
    exitPlate: at(0, 0.62, GATE_STOP - 2.17),
  };
}

const coneGeo = (len: number) => new THREE.ConeGeometry(1.4, len, 24, 1, true).translate(0, -len / 2, 0).rotateX(-Math.PI / 2);

function Mat({ c, r = 0.8, m = 0 }: { c: string; r?: number; m?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} />;
}

// Pole + camera head in the gate's local frame, aimed at a world-space plate position.
function CameraHead({ at, target }: { at: [number, number, number]; target: THREE.Vector3 }) {
  const head = useRef<THREE.Group>(null!);
  useEffect(() => head.current.lookAt(target), [target]); // lookAt takes a world point, parent rotation included
  return (
    <>
      <mesh position={[at[0], at[1] / 2, at[2]]}>
        <cylinderGeometry args={[0.09, 0.11, at[1], 8]} />
        <Mat c="#4f5260" m={0.4} r={0.5} />
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

function Boom({ id, z, shadows }: { id: Gate['id']; z: number; shadows: boolean }) {
  const arm = useRef<THREE.Group>(null!);
  useFrame(() => {
    arm.current.rotation.z = -gates[id].boom * 1.42;
  });
  return (
    <>
      <mesh position={[ROAD_W / 2 + 0.3, 0.55, z]} castShadow={shadows}>
        <boxGeometry args={[0.6, 1.1, 0.6]} />
        <Mat c="#ffc044" r={0.6} />
      </mesh>
      <group ref={arm} position={[ROAD_W / 2 + 0.3, 1.05, z]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-(i + 0.5) * (BOOM_LEN / 6), 0, 0]}>
            <boxGeometry args={[BOOM_LEN / 6, 0.14, 0.14]} />
            <Mat c={i % 2 ? '#f7f7f2' : '#cf534f'} r={0.5} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Cones({ g }: { g: Gate }) {
  const f = useMemo(() => gateFrame(g), [g]);
  const geo = useMemo(() => ({ in: coneGeo(f.cam.distanceTo(f.entryPlate)), out: coneGeo(f.cam.distanceTo(f.exitPlate)) }), [f]);
  useEffect(() => () => Object.values(geo).forEach((x) => x.dispose()), [geo]);
  const a = useRef<THREE.Mesh>(null!);
  const b = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const s = gates[g.id];
    (a.current.material as THREE.MeshBasicMaterial).opacity = s.cone * 0.32;
    a.current.visible = s.cone > 0.01;
    (b.current.material as THREE.MeshBasicMaterial).opacity = s.coneOut * 0.32;
    b.current.visible = s.coneOut > 0.01;
  });
  return (
    <>
      <mesh ref={a} geometry={geo.in} position={f.cam} onUpdate={(m) => m.lookAt(f.entryPlate)} visible={false}>
        <meshBasicMaterial color="#ffc044" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={b} geometry={geo.out} position={f.cam} onUpdate={(m) => m.lookAt(f.exitPlate)} visible={false}>
        <meshBasicMaterial color="#ffc044" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function Sign({ lines, at, rot, w = 6.4, h = 3.2, red = false }: { lines: string[]; at: [number, number, number]; rot: number; w?: number; h?: number; red?: boolean }) {
  const key = lines.join('|');
  const tex = useMemo(
    () => (red ? signTexture(key.split('|'), { size: 120, bg: '#c42525', shade: '#12297d' }) : signTexture(key.split('|'), { size: 120 })),
    [key, red],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={at} rotation-y={rot}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.5} />
    </mesh>
  );
}

// Photo 1: a broad white canopy curving round the corner forecourt on stone pillars, yellow-kerbed planters,
// the guard booth, and the boom and camera where the driveway passes under its middle.
const canopyGeometry = () => {
  const { x, z, r, w } = CANOPY;
  const sh = new THREE.Shape();
  // shape space (x, -z); heading h maps to angle h - π/2
  sh.absarc(x, -z, r + w / 2, -Math.PI / 2, 0, false);
  sh.absarc(x, -z, r - w / 2, 0, -Math.PI / 2, true);
  sh.closePath();
  return new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 48 }).rotateX(-Math.PI / 2).translate(0, 5.6, 0);
};

function MainGate({ g, shadows }: { g: Gate; shadows: boolean }) {
  const f = useMemo(() => gateFrame(g), [g]);
  const canopy = useMemo(canopyGeometry, []);
  useEffect(() => () => canopy.dispose(), [canopy]);
  return (
    <>
      <mesh geometry={canopy} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial color="#f4f3ee" roughness={0.45} />
      </mesh>
      {CANOPY_PILLARS.map((p) => (
        <group key={p.h} position={[p.x, 0, p.z]} rotation-y={p.h}>
          <mesh position={[0, 2.8, 0]} castShadow={shadows}>
            <boxGeometry args={[1.7, 5.6, 1.9]} />
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
            <Mat c="#ffc044" r={0.6} />
          </mesh>
        </group>
      ))}
      {CANOPY_PLANTERS.map((p) => (
        <group key={p.h} position={[p.x, 0, p.z]} rotation-y={p.h}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[2, 0.6, 1.3]} />
            <Mat c="#ffc044" r={0.6} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow={shadows}>
            <boxGeometry args={[1.6, 0.6, 1]} />
            <Mat c="#3d8a4a" />
          </mesh>
        </group>
      ))}
      {/* guard booth */}
      <group position={[CANOPY_BOOTH.x, 0, CANOPY_BOOTH.z]} rotation-y={CANOPY_BOOTH.h}>
        <mesh position={[0, 1.4, 0]} castShadow={shadows}>
          <boxGeometry args={[3, 2.8, 2.8]} />
          <Mat c="#efe9dc" />
        </mesh>
        <mesh position={[0, 2.95, 0]} castShadow={shadows}>
          <boxGeometry args={[3.6, 0.25, 3.4]} />
          <Mat c="#3f9a62" />
        </mesh>
        <mesh position={[0, 1.7, -1.41]} rotation-y={Math.PI}>
          <planeGeometry args={[2, 1.1]} />
          <Mat c="#22313d" r={0.2} m={0.3} />
        </mesh>
      </group>
      <group position={[g.x, 0, g.z]} rotation-y={g.inward}>
        <Sign lines={['ENTRY', 'ZONE A']} at={[0, 7.6, -CANOPY.w / 2 + 0.3]} rot={Math.PI} w={5.4} h={2.7} />
        <Boom id={g.id} z={-1.2} shadows={shadows} />
        <CameraHead at={f.camLocal} target={f.entryPlate} />
      </group>
    </>
  );
}

function NorthGate({ g, shadows }: { g: Gate; shadows: boolean }) {
  const f = useMemo(() => gateFrame(g), [g]);
  return (
    <group position={[g.x, 0, g.z]} rotation-y={g.inward}>
      {[
        [-5, -3.5], [5, -3.5], [-5, 3.5], [5, 3.5],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 2.4, z]} castShadow={shadows}>
          <boxGeometry args={[0.28, 4.8, 0.28]} />
          <Mat c="#d9dde2" m={0.5} r={0.4} />
        </mesh>
      ))}
      {/* slatted steel pergola */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, 4.95, -3.6 + i * 0.9]} castShadow={shadows}>
          <boxGeometry args={[11.4, 0.22, 0.32]} />
          <Mat c="#eef0f2" m={0.3} r={0.5} />
        </mesh>
      ))}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 4.75, 0]}>
          <boxGeometry args={[0.3, 0.3, 8]} />
          <Mat c="#d9dde2" m={0.5} r={0.4} />
        </mesh>
      ))}
      <Sign lines={['EXIT', 'ZONE A']} at={[0, 6.7, 0.02]} rot={0} red />
      <Sign lines={['EXIT', 'ZONE A']} at={[0, 6.7, -0.02]} rot={Math.PI} red />
      <Boom id={g.id} z={1.2} shadows={shadows} />
      <CameraHead at={f.camLocal} target={f.exitPlate} />
    </group>
  );
}

function Gantry({ g, shadows }: { g: Gate; shadows: boolean }) {
  const f = useMemo(() => gateFrame(g), [g]);
  const code = ['A', 'B', 'C'][g.zone];
  return (
    <group position={[g.x, 0, g.z]} rotation-y={g.inward}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (ROAD_W / 2 + 0.7), 2.9, 0]} castShadow={shadows}>
          <boxGeometry args={[0.36, 5.8, 0.36]} />
          <Mat c="#a0a8c9" m={0.4} r={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 5.9, 0]} castShadow={shadows}>
        <boxGeometry args={[ROAD_W + 1.8, 0.45, 0.45]} />
        <Mat c="#a0a8c9" m={0.4} r={0.45} />
      </mesh>
      <Sign lines={[`ZONE ${code}`, 'GATE CAMERA']} at={[0, 7.4, -0.24]} rot={Math.PI} w={5} h={2.5} />
      <Sign lines={[`ZONE ${code}`, 'GATE CAMERA']} at={[0, 7.4, 0.24]} rot={0} w={5} h={2.5} />
      <Boom id={g.id} z={0.6} shadows={shadows} />
      <mesh position={f.camLocal}>
        <boxGeometry args={[0.5, 0.42, 0.5]} />
        <Mat c="#f2f2ee" r={0.4} />
      </mesh>
    </group>
  );
}

export default function Gates({ shadows }: { shadows: boolean }) {
  return (
    <group>
      {GATE_LIST.map((g) => (
        <group key={g.id}>
          {g.style === 'canopy' && <MainGate g={g} shadows={shadows} />}
          {g.style === 'pergola' && <NorthGate g={g} shadows={shadows} />}
          {g.style === 'gantry' && <Gantry g={g} shadows={shadows} />}
          <Cones g={g} />
        </group>
      ))}
    </group>
  );
}
