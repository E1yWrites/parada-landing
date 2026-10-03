'use client';
// The 3D layer. Loaded after the HTML has painted; the page is complete without it
// (no WebGL, failed load, or old device → visitors just read the page).
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Scene = dynamic(() => import('./scene/Scene'), { ssr: false });

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

export default function Experience() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!hasWebGL()) return;
    document.documentElement.dataset.webgl = 'on';
    setOk(true);
  }, []);
  return (
    <div className="stage" aria-hidden="true">
      {ok && <Scene />}
      <div className="stage-dim" id="stage-dim" />
    </div>
  );
}
