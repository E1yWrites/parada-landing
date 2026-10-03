'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Campus from './Campus';
import Pipeline from './Pipeline';
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
      <fog attach="fog" args={['#0B0F15', 190, 440]} />
      <hemisphereLight args={['#c8d4e6', '#0b0f15', 0.7]} />
      <directionalLight
        position={[50, 90, 40]}
        intensity={1.6}
        castShadow={!mobile}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-far={300}
      />
      <Campus shadows={!mobile} />
      <Pipeline />
      <CameraRig path={path} reduced={reduced} />
    </Canvas>
  );
}
