// Scroll owns the camera. Each [data-cam] element is a stop, reached when its centre crosses the reading line.
// Between marketing stops the camera holds, then eases across; through the pipeline it follows the demo car
// at the scroll's own pace. A damped copy of the scroll value drives everything, so wheel steps glide.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PIPELINE } from '@/lib/content';
import { game } from '@/lib/game';
import { CAM, type CamStop } from './cameraPath';
import { scroll, demoCar } from './state';

const LINE = 0.55; // reading line, fraction of the viewport height
const FOLLOW = new Set<string>(PIPELINE.map((s) => s.id));
// hold around each marketing stop, ease across the middle half of the gap
const holdEase = (f: number) => {
  const x = Math.min(1, Math.max(0, (f - 0.25) / 0.5));
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};

const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const lA = new THREE.Vector3();
const lB = new THREE.Vector3();
const vPos = new THREE.Vector3();
const vLook = new THREE.Vector3();
const car = new THREE.Vector3();
const poi = new THREE.Vector3();

// A stop's pose. Follow stops sit in the car's frame (x right, y up, z forward) and can lean their gaze toward a point.
// The car is parked at its path's ends when hidden, so follow stops stay anchored before and after the tour.
function pose(s: CamStop, heading: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const f = s.follow;
  if (!f) {
    pos.set(...s.pos);
    look.set(...s.look);
    return;
  }
  car.set(demoCar.pos.x, 0, demoCar.pos.z);
  const c = Math.cos(heading);
  const sn = Math.sin(heading);
  const [x, y, z] = f.off;
  // car frame: forward (sin h, cos h); right (-cos h, sin h) for a nose along +z
  pos.set(car.x - x * c + z * sn, y, car.z + x * sn + z * c);
  const ahead = f.ahead ?? 2;
  look.set(car.x + sn * ahead, 1.4, car.z + c * ahead);
  if (f.look) look.lerp(poi.set(...f.look), f.mix ?? 1);
}

export default function CameraRig({ path, reduced }: { path: string; reduced: boolean }) {
  const camera = useThree((s) => s.camera);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const look = useRef(new THREE.Vector3(...CAM.hero.look));
  const stops = useRef<CamStop[]>([CAM.hero]);
  const target = useRef(0);
  const smooth = useRef(0);
  const heading = useRef(0);
  const settled = useRef(0);

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-cam]')];
    const keys = els.map((el) => el.dataset.cam!);
    scroll.keys = keys;
    stops.current = keys.map((k) => CAM[k] ?? CAM.hero);
    let centers: number[] = [];
    const wake = () => {
      settled.current = 0;
      setFrameloop('always');
    };
    const measure = () => {
      centers = els.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + scrollY + r.height / 2;
      });
    };
    const update = () => {
      const r = scrollY + innerHeight * LINE;
      let t = 0;
      if (centers.length > 1 && r > centers[0]) {
        if (r >= centers[centers.length - 1]) t = centers.length - 1;
        else {
          let i = 0;
          while (r >= centers[i + 1]) i++;
          const f = (r - centers[i]) / (centers[i + 1] - centers[i]);
          const linear = FOLLOW.has(keys[i]) || FOLLOW.has(keys[i + 1]);
          t = i + (reduced ? Math.round(f) : linear ? f : holdEase(f));
        }
      }
      target.current = t;
      wake();
    };
    const refresh = () => {
      measure();
      update();
    };
    refresh();
    smooth.current = target.current; // deep links and reloads start on the right stop
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    document.fonts?.ready.then(refresh);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', refresh);
      ro.disconnect();
    };
  }, [path, reduced, setFrameloop]);

  useFrame((state, dt) => {
    const d = target.current - smooth.current;
    smooth.current = reduced || Math.abs(d) < 1e-4 ? target.current : smooth.current + d * (1 - Math.exp(-7 * Math.min(dt, 0.1)));
    scroll.t = smooth.current;
    const cam = camera as THREE.PerspectiveCamera;
    if (game.get().driving) {
      cam.clearViewOffset(); // drive mode flies its own chase camera
      return;
    }
    const list = stops.current;
    const t = smooth.current;
    const i = Math.min(Math.floor(t), list.length - 1);
    const f = t - i;
    const tall = state.size.width / state.size.height < 0.9;
    const variant = (s: CamStop) => (tall && s.portrait ? { ...s, ...s.portrait } : s);
    const a = variant(list[i]);
    const b = variant(list[Math.min(i + 1, list.length - 1)]);

    // the car's heading, smoothed so the follow camera swings rather than snaps
    let dh = demoCar.heading - heading.current;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    heading.current += dh * (reduced ? 1 : 1 - Math.exp(-3 * dt));

    pose(a, heading.current, vA, lA);
    pose(b, heading.current, vB, lB);
    vPos.lerpVectors(vA, vB, f);
    vLook.lerpVectors(lA, lB, f);
    if (a.orbit && !reduced) {
      // slow orbit around the look target, fading out as we leave the stop
      const ang = state.clock.elapsedTime * 0.06 * (1 - f);
      vA.subVectors(vPos, vLook).applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(ang) * 0.35);
      vPos.addVectors(vLook, vA);
    }

    // Portrait screens see a narrower slice; pull back so the frame still holds the subject.
    const aspect = state.size.width / state.size.height;
    // Close follow shots pull back less, or the camera would back into the canopy and the buildings.
    const full = Math.min(2, Math.max(1, Math.sqrt(1.6 / aspect)));
    const followW = (a.follow ? 1 - f : 0) + (b.follow ? f : 0);
    const pull = full - (full - 1) * 0.65 * followW;
    if (pull > 1) vPos.sub(vLook).multiplyScalar(pull).add(vLook);

    const following = !!(a.follow || b.follow);
    const k = reduced ? 1 : 1 - Math.exp(-(following ? 6 : 4) * dt);
    camera.position.lerp(vPos, k);
    look.current.lerp(vLook, k);
    camera.lookAt(look.current);

    // Board-side offset: on wide screens a positive shift slides the subject right (board on the left), a negative
    // one left; tall screens slide it up, above the board that sits at the bottom.
    const shift = aspect > 1.2 || tall ? (a.shift ?? 0) + ((b.shift ?? 0) - (a.shift ?? 0)) * f : 0;
    const { width: w, height: h } = state.size;
    if (Math.abs(shift) > 1e-4) cam.setViewOffset(w, h, tall ? 0 : -shift * w, tall ? Math.abs(shift) * h : 0, w, h);
    else if (cam.view?.enabled) cam.clearViewOffset();

    const dim = (a.dim ?? 0) + ((b.dim ?? 0) - (a.dim ?? 0)) * f;
    const el = document.getElementById('stage-dim');
    if (el) el.style.opacity = String(dim);

    // Stop rendering once parked on a calm stop; any scroll wakes it again.
    if (a.still && f === 0 && camera.position.distanceToSquared(vPos) < 1e-4) {
      if (++settled.current > 10) setFrameloop('never');
    }
  });

  return null;
}
