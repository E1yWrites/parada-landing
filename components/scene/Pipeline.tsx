// The scroll tour: one car up Tolentino Rd, under the main-gate canopy into Zone A, down the tree avenue into a
// bay, round the loop and out through the north gate. It follows PARADA's order of events: the entry camera
// reads the plate, the API resolves it, and Zone A's count and the session change together at the gate; the
// bay itself changes nothing; the exit camera closes the session and the count falls back.
// One paused GSAP timeline (1 unit per pipeline step) tweens the plain numbers in `S`; each frame seeks it from
// the smoothed scroll position and applies S to the car, gates and labels. Hidden while drive mode is on.
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { DEMO_PLATE, RECEIPT, ZONES } from '@/lib/content';
import { sound, type Sfx } from '@/lib/sfx';
import { game } from '@/lib/game';
import { PATHS, GATES } from './layout';
import { scroll, stopIndex, gates, demoCar } from './state';
import { gateFrame } from './Gates';
import { POI } from './cameraPath';
import { useCars } from './kit';
import { plateTexture } from './signs';

const ZONE_A = ZONES[0];
const ENTRY = gateFrame(GATES.main);
const v = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
const API_POS = v(POI.api);
const PLATE_FLOAT = v(POI.plate);

const S = {
  arrive: 0, cone: 0, plate: 0, scan: 0, ocr: 0, packet: 0, api: 0, branch: 0, registered: 0,
  count: ZONE_A.occupied, session: 0, boom: 0, park: 0,
  reverse: 0, loop: 0, exitCone: 0, exitBoom: 0, out: 0, receipt: 0,
};

const CUES: [number, Sfx][] = [
  [1.05, 'scan'], [2.4, 'ocr'], [3.1, 'whoosh'], [4.45, 'decide'], [5.45, 'chime'],
  [7.95, 'scan'], [8.2, 'print'],
];

const buildTimeline = () => {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to(S, { arrive: 1, duration: 0.92, ease: 'power2.out' }, 0)
    // camera observes, plate captured, OCR reads it
    .to(S, { cone: 1, duration: 0.35 }, 1.0)
    .to(S, { plate: 1, duration: 0.4, ease: 'power2.out' }, 1.9)
    .to(S, { scan: 1, duration: 0.4 }, 2.35)
    .to(S, { ocr: 1, duration: 0.12 }, 2.75)
    .to(S, { cone: 0, duration: 0.2 }, 3.0)
    .to(S, { plate: 0, duration: 0.15 }, 3.1)
    .to(S, { ocr: 0, duration: 0.15 }, 3.6)
    // the event travels to the API, which resolves the plate
    .to(S, { packet: 1, duration: 0.6, ease: 'power1.inOut' }, 3.1)
    .to(S, { api: 1, duration: 0.15 }, 3.7)
    .to(S, { branch: 1, duration: 0.25 }, 4.05)
    .to(S, { registered: 1, duration: 0.2 }, 4.45)
    // one transaction: Zone A's count and the session, then the boom lifts
    .to(S, { count: ZONE_A.occupied + 1, duration: 0.02 }, 5.45)
    .to(S, { session: 1, duration: 0.15 }, 5.45)
    .to(S, { boom: 1, duration: 0.2, ease: 'power2.out' }, 5.5)
    .to(S, { park: 1, duration: 0.85, ease: 'power1.inOut' }, 5.55)
    .to(S, { boom: 0, duration: 0.25 }, 6.0)
    .to(S, { branch: 0, registered: 0, duration: 0.2 }, 6.05)
    // step 7 (both clients read the new state) happens with the car parked in its bay
    .to(S, { session: 0, duration: 0.1 }, 6.85)
    // then out of the bay and round the loop to the exit camera: nearly the whole step, played slowly (CameraRig)
    .to(S, { reverse: 1, duration: 0.15, ease: 'power1.inOut' }, 7.03)
    .to(S, { loop: 1, duration: 0.79, ease: 'sine.inOut' }, 7.18)
    .to(S, { exitCone: 1, duration: 0.12 }, 7.95)
    .to(S, { count: ZONE_A.occupied, duration: 0.02 }, 8.2)
    .to(S, { receipt: 1, duration: 0.3, ease: 'power2.out' }, 8.2)
    .to(S, { exitBoom: 1, duration: 0.2, ease: 'power2.out' }, 8.25)
    .to(S, { exitCone: 0, duration: 0.15 }, 8.3)
    .to(S, { out: 1, duration: 1.2, ease: 'power1.in' }, 8.4)
    .to(S, { exitBoom: 0, duration: 0.25 }, 8.85)
    .to(S, { api: 0, duration: 0.2 }, 9.4)
    .to(S, { receipt: 0, duration: 0.3 }, 9.5)
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
      <mesh geometry={player} material={material} />
      {/* a soft blob under the car: shadows are baked once, so a moving car can't cast a live one */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} renderOrder={1}>
        <planeGeometry args={[2.9, 5.6]} />
        <meshBasicMaterial map={blobTexture()} color="#000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
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

let blob: THREE.Texture | null = null;
const blobTexture = () => {
  if (blob) return blob;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  blob = new THREE.CanvasTexture(c); // white alpha mask; the material tints it black
  return blob;
};

export default function Pipeline() {
  const tl = useMemo(buildTimeline, []);
  const res = useMemo(
    () => ({
      plate: plateTexture(DEMO_PLATE),
      arc: new THREE.QuadraticBezierCurve3(ENTRY.cam, ENTRY.cam.clone().lerp(API_POS, 0.5).setY(API_POS.y + 7), API_POS),
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
  const above = useRef<THREE.Group>(null!);
  const plate = useRef<THREE.Group>(null!);
  const scanLine = useRef<THREE.Mesh>(null!);
  const packet = useRef<THREE.Mesh>(null!);
  const api = useRef<THREE.Mesh>(null!);
  const apiGroup = useRef<THREE.Group>(null!);
  const ui = useRef<Record<string, HTMLElement | null>>({});
  const bind = (k: string) => (el: HTMLElement | null) => {
    ui.current[k] = el;
  };
  const last = useRef(0);

  useFrame((state) => {
    const driving = game.get().driving;
    root.current.visible = !driving;
    if (driving) {
      last.current = 0;
      demoCar.visible = false;
      for (const k of ['ocr', 'branch', 'session', 'receipt', 'apiLabel']) show(ui.current[k], 0);
      return;
    }
    const base = stopIndex('arrive') - 1;
    const time = base < 0 ? 0 : gsap.utils.clamp(0, tl.duration(), scroll.t - base);
    const prev = last.current;
    tl.time(time, true);
    if (time > prev && time - prev < 1.2) for (const [at, name] of CUES) if (at > prev && at <= time) sound.play(name);
    last.current = time;

    // car: whichever leg of the journey is active
    const leg = S.out > 0 ? [PATHS.out, S.out, 1] : S.loop > 0 ? [PATHS.loop, S.loop, 1] : S.reverse > 0 ? [PATHS.reverse, S.reverse, -1] : S.park > 0 ? [PATHS.park, S.park, 1] : [PATHS.arrive, S.arrive, 1];
    const [path, u, dir] = leg as [THREE.CatmullRomCurve3, number, number];
    path.getPointAt(u, tmpV);
    path.getTangentAt(Math.min(Math.max(u, 0.001), 0.999), tmpT);
    const heading = Math.atan2(tmpT.x * dir, tmpT.z * dir);
    car.current.position.copy(tmpV);
    car.current.rotation.y = heading;
    car.current.visible = S.arrive > 0.001 && S.out < 0.999;
    above.current.position.copy(tmpV);
    Object.assign(demoCar.pos, { x: tmpV.x, y: 0, z: tmpV.z });
    demoCar.heading = heading;
    demoCar.visible = car.current.visible;

    gates.main.cone = S.cone;
    gates.main.boom = S.boom;
    gates.north.coneOut = S.exitCone;
    gates.north.boom = S.exitBoom;

    // plate lifts off the bumper, grows, faces the viewer; scan line sweeps across it
    plate.current.position.lerpVectors(ENTRY.entryPlate, PLATE_FLOAT, S.plate);
    plate.current.scale.setScalar(0.6 + S.plate * 2.6);
    plate.current.lookAt(state.camera.position);
    plate.current.visible = S.plate > 0.01;
    scanLine.current.position.x = -0.5 + S.scan;
    scanLine.current.visible = S.scan > 0 && S.scan < 1;

    packet.current.visible = S.packet > 0.01 && S.packet < 0.99;
    res.arc.getPoint(S.packet, packet.current.position);
    // the API node only exists on screen while the pipeline needs it
    const apiOn = time > 2.9 && time < 9.6;
    apiGroup.current.visible = apiOn;
    // an Html label is projected even when its point is behind the camera; only show it in front
    const apiInView = tmpV.copy(API_POS).applyMatrix4(state.camera.matrixWorldInverse).z < 0;
    show(ui.current.apiLabel, apiOn && apiInView ? 1 : 0);
    (api.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + S.api * 1.4;
    api.current.rotation.y += 0.005;

    show(ui.current.ocr, S.ocr);
    show(ui.current.branch, S.branch);
    ui.current.registered?.classList.toggle('is-on', S.registered > 0.5);
    ui.current.guest?.classList.toggle('is-off', S.registered > 0.5);
    show(ui.current.session, S.session);
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
      {/* the session rides with the car once the gate has opened it */}
      <group ref={above}>
        <Html position={[0, 4.6, 0]} center zIndexRange={[1, 0]}>
          <div ref={bind('session')} className="chip3d">
            Session opened · <b>{DEMO_PLATE}</b>
          </div>
        </Html>
      </group>

      {/* lifted plate + OCR scan line + result */}
      <group ref={plate}>
        <mesh>
          <planeGeometry args={[1, 0.31]} />
          <meshBasicMaterial map={res.plate} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={scanLine} position={[0, 0, 0.01]}>
          <planeGeometry args={[0.02, 0.4]} />
          <meshBasicMaterial color="#c42525" />
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
          <octahedronGeometry args={[2.2, 0]} />
          <meshStandardMaterial color="#1b3fb8" emissive="#f6c31c" emissiveIntensity={0.3} flatShading roughness={0.3} />
        </mesh>
      </group>
      <Html position={[API_POS.x, API_POS.y + 3.4, API_POS.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('apiLabel')} className="chip3d">PARADA API</div>
      </Html>
      <mesh ref={packet}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#f6c31c" />
      </mesh>
      <Html position={[API_POS.x, API_POS.y - 3.6, API_POS.z]} center zIndexRange={[1, 0]}>
        <div ref={bind('branch')} className="branch3d">
          <span ref={bind('registered')}>
            <b>Registered vehicle</b> → registered user → session
          </span>
          <span ref={bind('guest')}>
            <b>Guest candidate</b> → guest admission policy
          </span>
        </div>
      </Html>

      {/* receipt where the exit camera closed the session */}
      <Html position={POI.receipt} center zIndexRange={[1, 0]}>
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
