'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Campus from './Campus';
import Pipeline from './Pipeline';
import Drive from './Drive';
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
      {/* tropical noon: high warm sun, sky-blue fill, light haze */}
      <color attach="background" args={['#bfe3f5']} />
      <fog attach="fog" args={['#cfe8f3', 300, 650]} />
      <hemisphereLight args={['#d8efff', '#6f8a4a', 1.1]} />
      <directionalLight
        position={[60, 120, 40]}
        intensity={2.4}
        color="#fff4dc"
        castShadow={!mobile}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-far={320}
      />
      {/* drei <Html> re-roots when the Canvas connects its events, so mount labelled parts after that */}
      {ready && <Campus shadows={!mobile} />}
      {ready && <Pipeline />}
      <Drive reduced={reduced} />
      <CameraRig path={path} reduced={reduced} />
    </Canvas>
  );
}
