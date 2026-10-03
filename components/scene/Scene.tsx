'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Lot from './Lot';
import CameraRig from './CameraRig';
import { CAM } from './cameraPath';

const media = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export default function Scene() {
  const path = usePathname();
  const [mobile] = useState(() => media('(max-width: 768px), (pointer: coarse)'));
  const [reduced, setReduced] = useState(() => media('(prefers-reduced-motion: reduce)'));
  const [ready, setReady] = useState(false);

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
      shadows={mobile ? false : 'percentage'}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.5, far: 400, position: CAM.hero.pos }}
      onCreated={() => setReady(true)}
    >
      <color attach="background" args={['#0B0F15']} />
      <fog attach="fog" args={['#0B0F15', 140, 320]} />
      <hemisphereLight args={['#c8d4e6', '#0b0f15', 0.7]} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={1.6}
        castShadow={!mobile}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <Lot shadows={!mobile} />
      <CameraRig path={path} reduced={reduced} />
    </Canvas>
  );
}
