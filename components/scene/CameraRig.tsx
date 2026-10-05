// Scroll owns the camera. Each [data-cam] element is a stop, reached when its top reaches the sticky header.
// Between marketing stops the camera holds, then eases across; through the pipeline it follows the demo car
// at the scroll's own pace. A damped copy of the scroll value drives everything, so wheel steps glide.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PIPELINE } from '@/lib/content';
import { game } from '@/lib/game';
import { CAM, type CamStop } from './cameraPath';
import { scroll, demoCar, stopIndex } from './state';

const FOLLOW = new Set<string>(PIPELINE.map((s) => s.id));
// tour playback, in timeline units (one per step) per second
const STEP_PACE = 0.6;
const ARRIVE_PACE = 0.35; // up Tolentino Rd to the canopy
const LOOP_PACE = 0.17; // out of the bay, round the loop, up to the exit camera
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

// Follow stops sit in the car's frame (x right, y up, z forward) and can lean their gaze toward a point. The car is
// parked at its path's ends when hidden, so follow stops stay anchored before and after the tour.
type Follow = NonNullable<CamStop['follow']>;
function followPose(off: readonly [number, number, number], f: Follow, heading: number, pos: THREE.Vector3, look: THREE.Vector3) {
  car.set(demoCar.pos.x, 0, demoCar.pos.z);
  const c = Math.cos(heading);
  const sn = Math.sin(heading);
  const [x, y, z] = off;
  // car frame: forward (sin h, cos h); right (-cos h, sin h) for a nose along +z
  pos.set(car.x - x * c + z * sn, y, car.z + x * sn + z * c);
  const ahead = f.ahead ?? 2;
  look.set(car.x + sn * ahead, 1.4, car.z + c * ahead);
  if (f.look) look.lerp(poi.set(...f.look), f.mix ?? 1);
}
function pose(s: CamStop, heading: number, pos: THREE.Vector3, look: THREE.Vector3) {
  if (s.follow) followPose(s.follow.off, s.follow, heading, pos, look);
  else {
    pos.set(...s.pos);
    look.set(...s.look);
  }
}
// Two follow offsets blended as an orbit round the car (angle the short way, distance, height), so a move from a
// front shot to a rear shot swings round the car instead of cutting through it.
const polar = ([x, y, z]: readonly [number, number, number]) => [Math.atan2(x, z), Math.hypot(x, z), y] as const;
function orbitOffset(a: Follow, b: Follow, e: number): [number, number, number] {
  const [ta, ra, ya] = polar(a.off);
  const [tb, rb, yb] = polar(b.off);
  let dt = tb - ta;
  dt = Math.atan2(Math.sin(dt), Math.cos(dt));
  const t = ta + dt * e;
  const r = ra + (rb - ra) * e;
  return [Math.sin(t) * r, ya + (yb - ya) * e, Math.cos(t) * r];
}
// zero velocity at both ends of a segment: the camera settles on each step instead of turning a corner at it
const ease = (f: number) => f * f * f * (f * (f * 6 - 15) + 10);

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
    // a page with no stops of its own (the 404) gets the dimmed overview, so the list is never empty
    stops.current = keys.length ? keys.map((k) => CAM[k] ?? CAM.hero) : [CAM.tech];
    let tops: number[] = [];
    const wake = () => {
      settled.current = 0;
      setFrameloop('always');
    };
    // Stops are keyed to section tops: a snapped section always lands with its top under the sticky header, so
    // every snap is an exact stop (and the scene can sleep there) however tall the section is.
    const measure = () => {
      tops = els.map((el) => el.getBoundingClientRect().top + scrollY);
    };
    const update = () => {
      const hdr = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
      const r = scrollY + hdr + 0.5; // half a pixel past the edge, so a snapped section counts as reached
      let t = 0;
      if (tops.length > 1 && r > tops[0]) {
        if (r >= tops[tops.length - 1]) t = tops.length - 1;
        else {
          let i = 0;
          while (r >= tops[i + 1]) i++;
          const f = (r - tops[i]) / (tops[i + 1] - tops[i]);
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
    // Approach the scrolled-to stop. Inside the tour a one-step move plays at a set pace, so what happens between
    // two stops (the car driving up, the loop to the exit) is seen rather than skipped; long jumps glide fast.
    const d = target.current - smooth.current;
    const tourT = smooth.current - (stopIndex('arrive') - 1); // tour timeline position
    const step = Math.min(dt, 0.1);
    if (reduced || Math.abs(d) < 1e-4) smooth.current = target.current;
    else if (Math.abs(d) <= 1.5 && tourT > -0.05 && tourT < PIPELINE.length + 0.05) {
      const pace = tourT > 7 && tourT < 8 ? LOOP_PACE : tourT < 1 ? ARRIVE_PACE : STEP_PACE;
      smooth.current += Math.sign(d) * Math.min(Math.abs(d), Math.min(pace, Math.abs(d) * 4) * step);
    } else smooth.current += d * (1 - Math.exp(-7 * step));
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

    // marketing segments are already hold-eased by the scroll mapping; follow segments ease here
    const e = a.follow || b.follow ? ease(f) : f;
    pose(a, heading.current, vA, lA);
    pose(b, heading.current, vB, lB);
    vLook.lerpVectors(lA, lB, e);
    if (a.follow && b.follow) {
      followPose(orbitOffset(a.follow, b.follow, e), a.follow, heading.current, vPos, vB);
    } else vPos.lerpVectors(vA, vB, e);
    // Portrait screens see a narrower slice; pull back so the frame still holds the subject.
    const aspect = state.size.width / state.size.height;
    // Close follow shots pull back less, or the camera would back into the canopy and the buildings.
    const full = Math.min(2, Math.max(1, Math.sqrt(1.6 / aspect)));
    const followW = (a.follow ? 1 - e : 0) + (b.follow ? e : 0);
    const pull = full - (full - 1) * 0.65 * followW;
    if (pull > 1) vPos.sub(vLook).multiplyScalar(pull).add(vLook);

    const following = !!(a.follow || b.follow);
    const k = reduced ? 1 : 1 - Math.exp(-(following ? 6 : 4) * dt);
    camera.position.lerp(vPos, k);
    look.current.lerp(vLook, k);
    camera.lookAt(look.current);

    // Board-side offset: on wide screens a positive shift slides the subject right (board on the left), a negative
    // one left; tall screens slide it up, above the board that sits at the bottom.
    const sh = (s: CamStop) => (tall && s.tallShift !== undefined ? s.tallShift : (s.shift ?? 0));
    const shift = aspect > 1.2 || tall ? sh(a) + (sh(b) - sh(a)) * e : 0;
    const { width: w, height: h } = state.size;
    if (Math.abs(shift) > 1e-4) cam.setViewOffset(w, h, tall ? 0 : -shift * w, tall ? Math.abs(shift) * h : 0, w, h);
    else if (cam.view?.enabled) cam.clearViewOffset();

    const dim = (a.dim ?? 0) + ((b.dim ?? 0) - (a.dim ?? 0)) * f;
    const el = document.getElementById('stage-dim');
    if (el) el.style.opacity = String(dim);

    // Stop rendering once the camera has landed on a stop: the scene is static there (the tour is a function of the
    // scroll), so nothing changes until the next scroll or resize wakes it.
    if (Math.min(f, 1 - f) < 1e-3 && Math.abs(target.current - t) < 1e-4 && camera.position.distanceToSquared(vPos) < 1e-4 && look.current.distanceToSquared(vLook) < 1e-4) {
      if (++settled.current > 10) setFrameloop('never');
    } else settled.current = 0;
  });

  return null;
}
