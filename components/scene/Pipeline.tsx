// The scroll tour: one car from the street, through ENTRY, into Zone A, round the U and out of EXIT.
// One paused GSAP timeline (1 unit per step) tweens the plain numbers in `S`; each frame we seek it
// from scroll position and apply S to meshes, gates and labels. Hidden while drive mode is on.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { DEMO_PLATE, RECEIPT, ZONES } from '@/lib/content';
import { sound, type Sfx } from '@/lib/sfx';
import { game } from '@/lib/game';
import { PATHS, EXIT, WEST_X, WALL_Z, DEMO_SLOT } from './layout';
import { scroll, stopIndex, near, gates } from './state';
import { ENTRY_CAM, ENTRY_PLATE } from './Gates';
import { useCars } from './kit';
import { plateTexture } from './signs';

export const API_POS = new THREE.Vector3(-33, 17, 30);
export const PHONE_POS = new THREE.Vector3(-39.5, 14.5, 33);
export const LAPTOP_POS = new THREE.Vector3(-26.5, 13.5, 33.5);
const PLATE_FLOAT = new THREE.Vector3(WEST_X, 3.3, WALL_Z + 0.6);
const OCR_VIEW = new THREE.Vector3(-46.5, 3.6, 35.5); // the 'ocr' camera stop; the lifted plate turns to face it
const ZONE_A = ZONES[0];

const S = {
  arrive: 0, cone: 0, plate: 0, scan: 0, ocr: 0, packet: 0, api: 0, branch: 0, registered: 0,
  boom: 0, park: 0, count: ZONE_A.occupied, session: 0, fan: 0, screens: 0,
  reverse: 0, leave: 0, exitCone: 0, slide: 0, out: 0, receipt: 0,
};

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

const tmpV = new THREE.Vector3();
const tmpT = new THREE.Vector3();
const show = (el: HTMLElement | null, v: number) => {
  if (!el) return;
  el.style.opacity = String(v);
  el.style.transform = `scale(${0.92 + 0.08 * v})`;
  el.style.visibility = v > 0.01 ? 'visible' : 'hidden';
};

// The player's car model with a readable plate on the nose. Shared with drive mode.
export function PlayerCar({ plate }: { plate: THREE.Texture }) {
  const { player, material } = useCars();
  return (
    <>
      <mesh geometry={player} material={material} castShadow />
      <mesh position={[0, 0.62, 2.17]}>
        <planeGeometry args={[0.62, 0.2]} />
        <meshBasicMaterial map={plate} />
      </mesh>
      <mesh position={[0, 0.66, -2.17]} rotation-y={Math.PI}>
        <planeGeometry args={[0.62, 0.2]} />
        <meshBasicMaterial map={plate} />
      </mesh>
    </>
  );
}

export default function Pipeline() {
  const tl = useMemo(buildTimeline, []);
  const res = useMemo(
    () => ({
      plate: plateTexture(DEMO_PLATE),
      arc: new THREE.QuadraticBezierCurve3(ENTRY_CAM, new THREE.Vector3(-38, 22, 40), API_POS),
      toPhone: new THREE.QuadraticBezierCurve3(API_POS, new THREE.Vector3(-37, 19, 32), PHONE_POS),
      toLaptop: new THREE.QuadraticBezierCurve3(API_POS, new THREE.Vector3(-29, 19, 32), LAPTOP_POS),
    }),
    [],
  );
  useEffect(
    () => () => {
      tl.kill();
      res.plate.dispose();
    },
    [tl, res],
  );

  const root = useRef<THREE.Group>(null!);
  const car = useRef<THREE.Group>(null!);
  const plate = useRef<THREE.Group>(null!);
  const scanLine = useRef<THREE.Mesh>(null!);
  const packet = useRef<THREE.Mesh>(null!);
  const fanA = useRef<THREE.Mesh>(null!);
  const fanB = useRef<THREE.Mesh>(null!);
  const api = useRef<THREE.Mesh>(null!);
  const apiGroup = useRef<THREE.Group>(null!);
  const devices = useRef<THREE.Group>(null!);
  const ui = useRef<Record<string, HTMLElement | null>>({});
  const bind = (k: string) => (el: HTMLElement | null) => {
    ui.current[k] = el;
  };
  const last = useRef(0);

  useFrame(() => {
    const driving = game.get().driving;
    root.current.visible = !driving;
    if (driving) {
      last.current = 0;
      for (const k of ['ocr', 'branch', 'session', 'phone', 'laptop', 'receipt', 'apiLabel']) show(ui.current[k], 0);
      return;
    }
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

    gates.entryCone = S.cone;
    gates.entryBoom = S.boom;
    gates.exitCone = S.exitCone;
    gates.exitSlide = S.slide;

    // plate lifts off the bumper, grows, faces the viewer; scan line sweeps across it
    plate.current.position.lerpVectors(ENTRY_PLATE, PLATE_FLOAT, S.plate);
    plate.current.scale.setScalar(0.6 + S.plate * 2.6);
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
    const screens = devOn ? Math.max(S.screens, near('apps', 1) > 0 ? 1 : 0) : 0;
    const apiMat = api.current.material as THREE.MeshStandardMaterial;
    apiMat.emissiveIntensity = 0.3 + S.api * 1.4;
    api.current.rotation.y += 0.005;

    show(ui.current.ocr, S.ocr);
    show(ui.current.branch, S.branch);
    ui.current.registered?.classList.toggle('is-on', S.registered > 0.5);
    ui.current.guest?.classList.toggle('is-off', S.registered > 0.5);
    show(ui.current.session, S.session);
    show(ui.current.phone, screens);
    show(ui.current.laptop, screens);
    show(ui.current.receipt, S.receipt);

    game.setCount(0, Math.round(S.count));
  });

  return (
    <group ref={root}>
      <group ref={car}>
        <Suspense fallback={null}>
          <PlayerCar plate={res.plate} />
        </Suspense>
      </group>

      {/* lifted plate + OCR scan line + result */}
      <group ref={plate}>
        <mesh>
          <planeGeometry args={[1, 0.31]} />
          <meshBasicMaterial map={res.plate} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={scanLine} position={[0, 0, 0.01]}>
          <planeGeometry args={[0.02, 0.4]} />
          <meshBasicMaterial color="#d22b2b" />
        </mesh>
      </group>
      <Html position={[PLATE_FLOAT.x, PLATE_FLOAT.y + 1.7, PLATE_FLOAT.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('ocr')} className="chip3d">
          OCR <b>{DEMO_PLATE}</b>
        </div>
      </Html>

      {/* API node, packet, registered vs guest branch */}
      <group ref={apiGroup}>
        <mesh ref={api} position={API_POS}>
          <octahedronGeometry args={[1.8, 0]} />
          <meshStandardMaterial color="#1b3fb8" emissive="#f6c31c" emissiveIntensity={0.3} flatShading roughness={0.3} />
        </mesh>
      </group>
      <Html position={[API_POS.x, API_POS.y + 3, API_POS.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('apiLabel')} className="chip3d">PARADA API</div>
      </Html>
      <mesh ref={packet}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color="#f6c31c" />
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
      <Html position={[DEMO_SLOT.x + 3, 4, DEMO_SLOT.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('session')} className="chip3d">
          Session opened · <b>{DEMO_PLATE}</b>
        </div>
      </Html>

      {/* state fans out to the clients */}
      <mesh ref={fanA}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshBasicMaterial color="#f6c31c" />
      </mesh>
      <mesh ref={fanB}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshBasicMaterial color="#f6c31c" />
      </mesh>
      <group ref={devices}>
        <Device kind="phone" at={PHONE_POS} bind={bind('phone')} />
        <Device kind="laptop" at={LAPTOP_POS} bind={bind('laptop')} />
      </group>

      {/* receipt at the exit gate */}
      <Html position={[EXIT.x - 14, 9, EXIT.z - 6]} center zIndexRange={[1, 0]}>
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
          <meshStandardMaterial color="#15171b" roughness={0.4} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 1.6, -1.6]} rotation-x={-0.2}>
            <boxGeometry args={[6, 3.8, 0.2]} />
            <meshStandardMaterial color="#15171b" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[6, 0.2, 3.6]} />
            <meshStandardMaterial color="#c9cfd6" roughness={0.4} metalness={0.5} />
          </mesh>
        </>
      )}
      <Html transform position={phone ? [0, 0, 0.14] : [0, 1.62, -1.48]} rotation-x={phone ? 0 : -0.2} distanceFactor={phone ? 4.2 : 5} zIndexRange={[1, 0]}>
        <div ref={bind} className={phone ? 'screen3d phone' : 'screen3d laptop'}>
          <div>
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
