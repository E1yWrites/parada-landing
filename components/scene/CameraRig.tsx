// Scroll owns the camera. One ScrollTrigger per [data-cam] element reports progress;
// the rig holds each stop while its text is read, then eases to the next stop.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CAM, type CamStop } from './cameraPath';
import { scroll } from './state';
import { game } from '@/lib/game';

gsap.registerPlugin(ScrollTrigger);

const HOLD = 0.55; // fraction of a stop's scroll spent holding before moving on
const vPos = new THREE.Vector3();
const vLook = new THREE.Vector3();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();

export default function CameraRig({ path, reduced }: { path: string; reduced: boolean }) {
  const camera = useThree((s) => s.camera);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const look = useRef(new THREE.Vector3(...CAM.hero.look));
  const stops = useRef<CamStop[]>([CAM.hero]);
  const t = useRef(0);
  const settled = useRef(0);

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-cam]')];
    stops.current = els.map((el) => CAM[el.dataset.cam!] ?? CAM.hero);
    scroll.keys = els.map((el) => el.dataset.cam!);
    const wake = () => {
      settled.current = 0;
      setFrameloop('always');
    };
    const triggers = els.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onUpdate: (self) => {
          const f = gsap.utils.clamp(0, 1, (self.progress - HOLD) / (1 - HOLD));
          t.current = reduced ? i + Math.round(f) : i + gsap.parseEase('power2.inOut')(f);
          wake();
        },
        onToggle: (self) => self.isActive && wake(),
      }),
    );
    // Start on whichever stop is under the viewport now (deep links, reloads).
    ScrollTrigger.refresh();
    const active = triggers.findIndex((tr) => tr.isActive);
    t.current = Math.max(0, active);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    wake();
    return () => triggers.forEach((tr) => tr.kill());
  }, [path, reduced, setFrameloop]);

  useFrame((state, dt) => {
    scroll.t = t.current;
    if (game.get().driving) {
      (camera as THREE.PerspectiveCamera).clearViewOffset(); // drive mode flies its own chase camera
      return;
    }
    const list = stops.current;
    const i = Math.min(Math.floor(t.current), list.length - 1);
    const tall = state.size.width / state.size.height < 0.9;
    const pose = (s: CamStop) => (tall && s.portrait ? { ...s, ...s.portrait } : s);
    const a = pose(list[i]);
    const b = pose(list[Math.min(i + 1, list.length - 1)]);
    const f = t.current - i;

    vPos.lerpVectors(vA.set(...a.pos), vB.set(...b.pos), f);
    vLook.lerpVectors(vA.set(...a.look), vB.set(...b.look), f);
    if (a.orbit && !reduced) {
      // slow orbit around the look target, fading out as we leave the stop
      const ang = state.clock.elapsedTime * 0.06 * (1 - f);
      vA.subVectors(vPos, vLook).applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(ang) * 0.35);
      vPos.addVectors(vLook, vA);
    }

    // Portrait screens see a narrower slice; pull back so the zones still fit.
    const aspect = state.size.width / state.size.height;
    const pull = Math.min(2, Math.max(1, Math.sqrt(1.6 / aspect)));
    if (pull > 1) vPos.sub(vLook).multiplyScalar(pull).add(vLook);

    const k = reduced ? 1 : 1 - Math.exp(-4 * dt);
    camera.position.lerp(vPos, k);
    look.current.lerp(vLook, k);
    camera.lookAt(look.current);

    // Board-side offset: wide screens slide the target right of the board; tall screens slide it up,
    // above the board that sits at the bottom.
    const shift = aspect > 1.2 || tall ? (a.shift ?? 0) + ((b.shift ?? 0) - (a.shift ?? 0)) * f : 0;
    const cam = camera as THREE.PerspectiveCamera;
    const { width: w, height: h } = state.size;
    if (shift > 1e-4) cam.setViewOffset(w, h, tall ? 0 : -shift * w, tall ? shift * h : 0, w, h);
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
