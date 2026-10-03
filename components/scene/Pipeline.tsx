// The arrival → receipt pipeline. One paused GSAP timeline (1 unit per step) tweens the plain
// numbers in `S`; each frame we seek it from scroll position and apply S to meshes and labels.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { DEMO_PLATE, RECEIPT, ZONES } from '@/lib/content';
import { sound, type Sfx } from '@/lib/sfx';
import { carGeometry } from './Campus';
import { PATHS, MAIN_GATE, EXIT_GATE, AVENUE_Z, FRONT_Z, DEMO_SLOT } from './layout';
import { scroll, stopIndex, near } from './state';

export const API_POS = new THREE.Vector3(-40, 20, 2);
export const PHONE_POS = new THREE.Vector3(-46, 17.5, 6);
export const LAPTOP_POS = new THREE.Vector3(-33, 16, 5);
const GATE_CAM = new THREE.Vector3(MAIN_GATE.x - 1.5, 4.6, AVENUE_Z + 5.2);
const EXIT_CAM = new THREE.Vector3(EXIT_GATE.x - 1.5, 4.6, FRONT_Z + 5.2);
const PLATE_FLOAT = new THREE.Vector3(-61.5, 3.4, 21);
const OCR_VIEW = new THREE.Vector3(-66, 3.8, 27.5); // the 'ocr' camera stop, plate turns to face it
const ZONE_A = ZONES[0];

const S = {
  arrive: 0, cone: 0, plate: 0, scan: 0, ocr: 0, packet: 0, api: 0, branch: 0, registered: 0,
  boom: 0, park: 0, count: ZONE_A.occupied, session: 0, fan: 0, screens: 0,
  reverse: 0, leave: 0, exitCone: 0, slide: 0, out: 0, receipt: 0,
};
export type PipelineState = typeof S;

const CUES: [number, Sfx][] = [
  [1.3, 'scan'], [2.5, 'ocr'], [3.1, 'whoosh'], [4.5, 'decide'], [5.05, 'chime'], [5.9, 'tick'],
  [6.6, 'ping'], [7.82, 'scan'], [7.95, 'tick'], [8.2, 'print'],
];

const buildTimeline = () => {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to(S, { arrive: 1, duration: 0.85, ease: 'power2.out' }, 0)
    .to(S, { cone: 1, duration: 0.3 }, 1.0)
    .to(S, { plate: 1, duration: 0.45, ease: 'power2.out' }, 2.0)
    .to(S, { scan: 1, duration: 0.35 }, 2.45)
    .to(S, { ocr: 1, duration: 0.12 }, 2.8)
    .to(S, { cone: 0, duration: 0.2 }, 3.0)
    .to(S, { plate: 0, duration: 0.15 }, 3.05)
    .to(S, { ocr: 0, duration: 0.15 }, 3.6)
    .to(S, { packet: 1, duration: 0.65, ease: 'power1.inOut' }, 3.1)
    .to(S, { api: 1, duration: 0.15 }, 3.75)
    .to(S, { branch: 1, duration: 0.25 }, 4.1)
    .to(S, { registered: 1, duration: 0.2 }, 4.45)
    .to(S, { boom: 1, duration: 0.2, ease: 'power2.out' }, 5.0)
    .to(S, { park: 1, duration: 0.7, ease: 'power1.inOut' }, 5.2)
    .to(S, { count: ZONE_A.occupied + 1, duration: 0.02 }, 5.9)
    .to(S, { session: 1, duration: 0.1 }, 5.9)
    .to(S, { boom: 0, duration: 0.2 }, 5.95)
    .to(S, { branch: 0, registered: 0, duration: 0.2 }, 6.0)
    .to(S, { fan: 1, duration: 0.5, ease: 'power1.inOut' }, 6.1)
    .to(S, { screens: 1, duration: 0.1 }, 6.6)
    .to(S, { session: 0, duration: 0.1 }, 6.95)
    .to(S, { reverse: 1, duration: 0.15, ease: 'power1.inOut' }, 7.0)
    .to(S, { leave: 1, duration: 0.62, ease: 'power1.inOut' }, 7.15)
    .to(S, { exitCone: 1, duration: 0.1 }, 7.8)
    .to(S, { count: ZONE_A.occupied, duration: 0.02 }, 7.95)
    .to(S, { slide: 1, duration: 0.15 }, 7.92)
    .to(S, { exitCone: 0, duration: 0.1 }, 8.0)
    .to(S, { out: 1, duration: 0.6, ease: 'power2.in' }, 8.05)
    .to(S, { receipt: 1, duration: 0.3, ease: 'power2.out' }, 8.1)
    .to(S, { slide: 0, duration: 0.2 }, 8.7)
    .to(S, { screens: 0, api: 0, duration: 0.2 }, 9.2)
    .to(S, { receipt: 0, duration: 0.3 }, 9.3)
    .set(S, {}, 10);
  return tl;
};

const plateTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f4f5f2';
  g.fillRect(0, 0, 512, 160);
  g.strokeStyle = '#1b1f26';
  g.lineWidth = 8;
  g.strokeRect(6, 6, 500, 148);
  g.fillStyle = '#1b1f26';
  g.font = '700 96px "IBM Plex Mono", ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(DEMO_PLATE, 256, 86);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const coneGeometry = (len: number) => new THREE.ConeGeometry(1.6, len, 24, 1, true).translate(0, -len / 2, 0).rotateX(-Math.PI / 2);

const tmpV = new THREE.Vector3();
const tmpT = new THREE.Vector3();
const show = (el: HTMLElement | null, v: number) => {
  if (!el) return;
  el.style.opacity = String(v);
  el.style.transform = `scale(${0.92 + 0.08 * v})`;
  el.style.visibility = v > 0.01 ? 'visible' : 'hidden';
};

export default function Pipeline() {
  const tl = useMemo(buildTimeline, []);
  const res = useMemo(
    () => ({
      car: carGeometry(),
      plate: plateTexture(),
      cone: coneGeometry(GATE_CAM.distanceTo(new THREE.Vector3(-60.8, 0.6, AVENUE_Z))),
      exitCone: coneGeometry(EXIT_CAM.distanceTo(new THREE.Vector3(70.2, 0.6, FRONT_Z))),
      arc: new THREE.QuadraticBezierCurve3(GATE_CAM, new THREE.Vector3(-52, 24, 14), API_POS),
      toPhone: new THREE.QuadraticBezierCurve3(API_POS, new THREE.Vector3(-44, 22, 5), PHONE_POS),
      toLaptop: new THREE.QuadraticBezierCurve3(API_POS, new THREE.Vector3(-36, 22, 5), LAPTOP_POS),
    }),
    [],
  );
  useEffect(
    () => () => {
      tl.kill();
      res.car.dispose();
      res.plate.dispose();
      res.cone.dispose();
      res.exitCone.dispose();
    },
    [tl, res],
  );

  const car = useRef<THREE.Group>(null!);
  const cone = useRef<THREE.Mesh>(null!);
  const exitCone = useRef<THREE.Mesh>(null!);
  const plate = useRef<THREE.Group>(null!);
  const scanLine = useRef<THREE.Mesh>(null!);
  const packet = useRef<THREE.Mesh>(null!);
  const fanA = useRef<THREE.Mesh>(null!);
  const fanB = useRef<THREE.Mesh>(null!);
  const api = useRef<THREE.Mesh>(null!);
  const apiGroup = useRef<THREE.Group>(null!);
  const devices = useRef<THREE.Group>(null!);
  const boom = useRef<THREE.Group>(null!);
  const slide = useRef<THREE.Mesh>(null!);
  const ui = useRef<Record<string, HTMLElement | null>>({});
  const bind = (k: string) => (el: HTMLElement | null) => {
    ui.current[k] = el;
  };
  const last = useRef(0);
  const lastCount = useRef(-1);

  useFrame(() => {
    const base = stopIndex('arrive') - 1;
    const time = base < 0 ? 0 : gsap.utils.clamp(0, tl.duration(), scroll.t - base);
    const prev = last.current;
    tl.time(time, true);
    if (time > prev && time - prev < 1.2) for (const [at, name] of CUES) if (at > prev && at <= time) sound.play(name);
    last.current = time;

    // car: whichever leg of the journey is active
    const leg = S.out > 0 ? [PATHS.out, S.out, 1] : S.leave > 0 ? [PATHS.leave, S.leave, 1] : S.reverse > 0 ? [PATHS.reverse, S.reverse, -1] : S.park > 0 ? [PATHS.park, S.park, 1] : [PATHS.arrive, S.arrive, 1];
    const [path, u, dir] = leg as [THREE.CatmullRomCurve3, number, number];
    path.getPointAt(u, tmpV);
    path.getTangentAt(Math.min(u, 0.999), tmpT);
    car.current.position.copy(tmpV);
    car.current.rotation.y = Math.atan2(tmpT.x * dir, tmpT.z * dir);
    car.current.visible = S.arrive > 0.001 && S.out < 0.999;

    const coneMat = cone.current.material as THREE.MeshBasicMaterial;
    coneMat.opacity = S.cone * 0.28;
    cone.current.visible = S.cone > 0.01;
    (exitCone.current.material as THREE.MeshBasicMaterial).opacity = S.exitCone * 0.28;
    exitCone.current.visible = S.exitCone > 0.01;

    // plate lifts off the bumper, grows, faces the viewer; scan line sweeps across it
    const front = tmpV.set(-60.85, 0.55, AVENUE_Z);
    plate.current.position.lerpVectors(front, PLATE_FLOAT, S.plate);
    plate.current.scale.setScalar(0.5 + S.plate * 2.5);
    plate.current.lookAt(OCR_VIEW);
    plate.current.visible = S.plate > 0.01;
    scanLine.current.position.x = -0.5 + S.scan;
    scanLine.current.visible = S.scan > 0 && S.scan < 1;

    packet.current.visible = S.packet > 0.01 && S.packet < 0.99;
    res.arc.getPoint(S.packet, packet.current.position);
    fanA.current.visible = fanB.current.visible = S.fan > 0.01 && S.fan < 0.99;
    res.toPhone.getPoint(S.fan, fanA.current.position);
    res.toLaptop.getPoint(S.fan, fanB.current.position);
    // API node and clients only exist on screen while the pipeline (or the apps chapter) needs them
    const apiOn = time > 2.9 && time < 9.6;
    const devOn = (time > 5.9 && time < 9.6) || near('apps', 1) > 0;
    apiGroup.current.visible = apiOn;
    devices.current.visible = devOn;
    show(ui.current.apiLabel, apiOn ? 1 : 0);
    if (!devOn) S.screens = 0;
    const apiMat = api.current.material as THREE.MeshStandardMaterial;
    apiMat.emissiveIntensity = 0.25 + S.api * 1.2;
    api.current.rotation.y += 0.005;

    boom.current.rotation.x = S.boom * 1.35;
    slide.current.position.z = S.slide * 7.5;

    show(ui.current.ocr, S.ocr);
    show(ui.current.branch, S.branch);
    ui.current.registered?.classList.toggle('is-on', S.registered > 0.5);
    ui.current.guest?.classList.toggle('is-off', S.registered > 0.5);
    show(ui.current.session, S.session);
    show(ui.current.phone, S.screens);
    show(ui.current.laptop, S.screens);
    show(ui.current.receipt, S.receipt);

    const n = Math.round(S.count);
    if (n !== lastCount.current) {
      lastCount.current = n;
      const el = document.getElementById(`zone-count-${ZONE_A.code}`);
      if (el) el.textContent = `${n} / ${ZONE_A.capacity}`;
    }
  });

  return (
    <group>
      <group ref={car}>
        <mesh geometry={res.car} castShadow>
          <meshStandardMaterial color="#5b92ff" roughness={0.45} metalness={0.2} flatShading />
        </mesh>
        <mesh position={[0, 0.55, 2.16]}>
          <planeGeometry args={[0.52, 0.16]} />
          <meshBasicMaterial map={res.plate} />
        </mesh>
      </group>

      {/* main gate: camera head, scan cone, boom */}
      <mesh position={GATE_CAM}>
        <boxGeometry args={[0.6, 0.45, 0.9]} />
        <meshStandardMaterial color="#20252c" />
      </mesh>
      <mesh ref={cone} geometry={res.cone} position={GATE_CAM} onUpdate={(m) => m.lookAt(-60.8, 0.6, AVENUE_Z)}>
        <meshBasicMaterial color="#5b92ff" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={boom} position={[MAIN_GATE.x + 1.2, 1.1, AVENUE_Z + 3.6]}>
        <mesh position={[0, 0, -3.6]}>
          <boxGeometry args={[0.18, 0.18, 7.2]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
      </group>

      {/* exit gate: camera, cone, sliding gate panel */}
      <mesh position={EXIT_CAM}>
        <boxGeometry args={[0.6, 0.45, 0.9]} />
        <meshStandardMaterial color="#20252c" />
      </mesh>
      <mesh ref={exitCone} geometry={res.exitCone} position={EXIT_CAM} onUpdate={(m) => m.lookAt(70.2, 0.6, FRONT_Z)}>
        <meshBasicMaterial color="#5b92ff" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={slide} position={[EXIT_GATE.x + 0.8, 1.2, FRONT_Z]}>
        <boxGeometry args={[0.2, 2.4, 7.4]} />
        <meshStandardMaterial color="#e9ebee" />
      </mesh>

      {/* lifted plate + OCR scan line + result */}
      <group ref={plate}>
        <mesh>
          <planeGeometry args={[1, 0.31]} />
          <meshBasicMaterial map={res.plate} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={scanLine} position={[0, 0, 0.01]}>
          <planeGeometry args={[0.02, 0.4]} />
          <meshBasicMaterial color="#5b92ff" />
        </mesh>
      </group>
      <Html position={[PLATE_FLOAT.x, PLATE_FLOAT.y + 1.6, PLATE_FLOAT.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('ocr')} className="chip3d">
          OCR <b>{DEMO_PLATE}</b>
        </div>
      </Html>

      {/* API node, packet, registered vs guest branch */}
      <group ref={apiGroup}>
      <mesh ref={api} position={API_POS}>
        <octahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial color="#1c2a44" emissive="#5b92ff" emissiveIntensity={0.25} flatShading />
      </mesh>
      <Html position={[API_POS.x, API_POS.y + 3, API_POS.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('apiLabel')} className="chip3d">PARADA API</div>
      </Html>
      </group>
      <mesh ref={packet}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color="#9cc0ff" />
      </mesh>
      <Html position={[API_POS.x, API_POS.y - 3.2, API_POS.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('branch')} className="branch3d">
          <span ref={bind('registered')}>
            <b>Registered vehicle</b> → registered user → session
          </span>
          <span ref={bind('guest')}>
            <b>Guest candidate</b> → guest admission policy
          </span>
        </div>
      </Html>

      {/* session opened, next to the slot */}
      <Html position={[DEMO_SLOT.x, 4, DEMO_SLOT.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('session')} className="chip3d">
          Session opened · <b>{DEMO_PLATE}</b>
        </div>
      </Html>

      {/* state fans out to the clients */}
      <mesh ref={fanA}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshBasicMaterial color="#9cc0ff" />
      </mesh>
      <mesh ref={fanB}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshBasicMaterial color="#9cc0ff" />
      </mesh>
      <group ref={devices}>
        <Device kind="phone" at={PHONE_POS} bind={bind('phone')} />
        <Device kind="laptop" at={LAPTOP_POS} bind={bind('laptop')} />
      </group>

      {/* receipt at the exit gate */}
      <Html position={[EXIT_GATE.x - 5, 8, FRONT_Z + 3]} center zIndexRange={[1, 0]}>
        <div ref={bind('receipt')} className="receipt3d">
          <b>Session closed</b>
          <dl>
            <dt>Plate</dt>
            <dd>{RECEIPT.plate}</dd>
            <dt>Zone</dt>
            <dd>{RECEIPT.zone}</dd>
            <dt>Duration</dt>
            <dd>{RECEIPT.duration}</dd>
            <dt>Rate</dt>
            <dd>{RECEIPT.rate}</dd>
            <dt>Fee</dt>
            <dd>{RECEIPT.fee}</dd>
          </dl>
        </div>
      </Html>
    </group>
  );
}

function Device({ kind, at, bind }: { kind: 'phone' | 'laptop'; at: THREE.Vector3; bind: (el: HTMLElement | null) => void }) {
  const phone = kind === 'phone';
  return (
    <group position={at} rotation-y={phone ? 0.25 : -0.25}>
      {phone ? (
        <mesh>
          <boxGeometry args={[2.2, 4.4, 0.25]} />
          <meshStandardMaterial color="#111418" roughness={0.4} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 1.6, -1.6]} rotation-x={-0.2}>
            <boxGeometry args={[6, 3.8, 0.2]} />
            <meshStandardMaterial color="#111418" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[6, 0.2, 3.6]} />
            <meshStandardMaterial color="#2a2f37" roughness={0.5} />
          </mesh>
        </>
      )}
      <Html transform position={phone ? [0, 0, 0.14] : [0, 1.62, -1.48]} rotation-x={phone ? 0 : -0.2} distanceFactor={phone ? 4.2 : 5} zIndexRange={[1, 0]}>
        <div className={phone ? 'screen3d phone' : 'screen3d laptop'}>
          <div ref={bind}>
            <small>{phone ? 'PARADA · Driver' : 'PARADA operations'}</small>
            <b>
              {ZONE_A.name} {ZONE_A.occupied + 1} / {ZONE_A.capacity}
            </b>
            <span>Session open · {DEMO_PLATE}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
