'use client';
// A run of panels that slides sideways while the page scrolls down. Each panel has an invisible one-screen stop in
// the page flow ([data-cam][data-snap]), so snapping, wheel and key paging, the slide counter and the camera all
// treat a panel like any other section; the panels sit in a sticky viewport and move by the scroll's progress
// through the stops. Without script the panels simply stack.
import { useEffect, useRef, type ReactNode } from 'react';

export default function Strip({ id, stops, label, children }: { id?: string; stops: string[]; label: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const root = document.documentElement;
    root.classList.add('js-strip');
    let raf = 0;
    const update = () => {
      raf = 0;
      const hdr = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
      const p = (hdr - el.getBoundingClientRect().top) / (innerHeight - hdr);
      el.style.setProperty('--p', String(Math.min(stops.length - 1, Math.max(0, p))));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // tabbing into a panel that is off to the side brings its stop on screen
    const onFocus = (e: FocusEvent) => {
      const i = [...el.querySelectorAll('.strip-panel')].findIndex((p) => p.contains(e.target as Node));
      const stop = el.querySelectorAll<HTMLElement>('.strip-stop')[i];
      if (stop && Math.abs(stop.getBoundingClientRect().top - (document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0)) > 2) stop.scrollIntoView({ block: 'start' });
    };
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    el.addEventListener('focusin', onFocus);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      el.removeEventListener('focusin', onFocus);
      root.classList.remove('js-strip');
    };
  }, [stops.length]);
  return (
    <section ref={ref} id={id} className="strip" aria-label={label} style={{ '--n': stops.length } as React.CSSProperties}>
      <div className="strip-stops" aria-hidden="true">
        {stops.map((k) => (
          <div key={k} className="strip-stop" data-cam={k} data-snap />
        ))}
      </div>
      <div className="strip-view">
        <div className="strip-track">{children}</div>
      </div>
    </section>
  );
}
