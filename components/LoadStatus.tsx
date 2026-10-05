'use client';
// The intro's loading line: a spinner and percentage while the 3D campus downloads, then a ready mark and the way
// in. Scene.tsx reports progress on `parada:load`; without WebGL the page simply carries on in HTML.
import { useEffect, useState } from 'react';

type Load = { progress: number; done: boolean };
declare global {
  interface Window {
    __paradaLoad?: Load;
  }
}

export default function LoadStatus() {
  const [load, setLoad] = useState<Load | null>(null);
  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    const on = (e: Event) => setLoad((e as CustomEvent<Load>).detail);
    addEventListener('parada:load', on);
    if (window.__paradaLoad) setLoad(window.__paradaLoad);
    // Experience marks WebGL support right after hydration; no mark means no 3D layer is coming
    const t = setTimeout(() => setWebgl(document.documentElement.dataset.webgl === 'on'), 600);
    return () => {
      removeEventListener('parada:load', on);
      clearTimeout(t);
    };
  }, []);
  const done = !webgl || !!load?.done;
  return (
    <div className="load" data-done={done || undefined} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="load-text">
        {!webgl ? 'Read on: the trip is told in the page below.' : done ? 'Campus ready.' : `Loading the campus model · ${Math.round(load?.progress ?? 0)}%`}
      </span>
      <a className="btn primary" href="#start" aria-disabled={!done || undefined}>
        Start the trip
      </a>
    </div>
  );
}
