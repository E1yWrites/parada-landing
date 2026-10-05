'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import Campus from './Campus';
import Pipeline from './Pipeline';
import Drive from './Drive';
import CameraRig from './CameraRig';
import { CAM } from './cameraPath';

// Tell the intro how the campus download is going (and remember it for late listeners).
function LoadSignal() {
  const { progress, active } = useProgress();
  useEffect(() => {
    const detail = { progress, done: !active && progress >= 100 };
    window.__paradaLoad = detail;
    dispatchEvent(new CustomEvent('parada:load', { detail }));
  }, [progress, active]);
  return null;
}

const media = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export default function Scene() {
  const path = usePathname();
  const [mobile] = useState(() => media('(max-width: 768px), (pointer: coarse)'));
  const [reduced, setReduced] = useState(() => media('(prefers-reduced-motion: reduce)'));
  const [ready, setReady] = useState(false);
  const [sunTarget] = useState(() => new THREE.Object3D()); // shadows centred on the campus, not the origin

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return (
    <Canvas
      className={ready ? 'canvas is-ready' : 'canvas'}
      dpr={[1, mobile ? 1.5 : 2]}
      shadows={mobile ? false : 'soft'}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.5, far: 700, position: CAM.hero.pos }}
      onCreated={() => setReady(true)}
    >
      {/* Batangas mid-morning: warm sun from the east-south-east, hazy sky fill, long soft shadows */}
      <color attach="background" args={['#cfe2ee']} />
      <fog attach="fog" args={['#d7e6ee', 260, 620]} />
      <hemisphereLight args={['#dceaf5', '#7d7458', 0.85]} />
      {/* a soft studio-free sky for reflections on glass and paint, rendered once */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} color="#eaf3fb" scale={[60, 30, 1]} position={[0, 30, -40]} rotation-x={Math.PI / 3} />
        <Lightformer form="rect" intensity={2.2} color="#fff0d6" scale={[20, 20, 1]} position={[60, 40, 30]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#8fa06d" scale={[80, 80, 1]} position={[0, -10, 0]} rotation-x={-Math.PI / 2} />
      </Environment>
      <primitive object={sunTarget} position={[0, 0, 40]} />
      <directionalLight
        target={sunTarget}
        position={[95, 95, 55]}
        intensity={2.9}
        color="#ffe7c2"
        castShadow={!mobile}
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-camera-far={380}
      />
      {/* drei <Html> re-roots when the Canvas connects its events, so mount labelled parts after that */}
      {ready && <Campus shadows={!mobile} mobile={mobile} />}
      {ready && <Pipeline />}
      <LoadSignal />
      <Drive reduced={reduced} />
      <CameraRig path={path} reduced={reduced} />
    </Canvas>
  );
}
