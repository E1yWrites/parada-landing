'use client';
// The 3D layer. Loaded after the HTML has painted; the page is complete without it
// (no WebGL, failed load, or old device → visitors just read the page). The landing page (/) is plain HTML and never
// downloads the campus; the demo and the documentation pages sit over it.
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
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
  const landing = usePathname() === '/';
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!hasWebGL()) return;
    document.documentElement.dataset.webgl = 'on';
    setOk(true);
  }, []);
  if (landing) return null;
  return (
    <div className="stage" aria-hidden="true">
      {ok && <Scene />}
      <div className="stage-dim" id="stage-dim" />
      <div className="stage-fade" id="stage-fade" />
    </div>
  );
}
