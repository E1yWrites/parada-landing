'use client';
// Home page only: one section per scroll, and each section's card pops in as it lands. CSS scroll snap handles
// touch, keyboard and the scrollbar; a mouse wheel notch is too small for mandatory snap to leave a tall section
// (it snaps back), so wheel input pages one section at a time here. A section taller than the screen scrolls
// natively until its edge, then pages on.
import { useEffect } from 'react';

const SETTLE_MS = 650;
const SLACK = 48; // px a section may overflow the screen and still page on the first notch

export default function SnapPop() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('snap', 'js-pop');
    const els = [...document.querySelectorAll<HTMLElement>('[data-snap]')];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-in', e.intersectionRatio > 0.5)), {
      threshold: [0, 0.5, 1],
    });
    els.forEach((el) => io.observe(el));

    let lockUntil = 0;
    const header = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || root.classList.contains('is-driving') || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const hdr = header();
      const view = innerHeight - hdr;
      // the section under the reading line
      const mid = hdr + view / 2;
      const i = els.findIndex((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      if (i < 0) return; // footer: native scroll
      const r = els[i].getBoundingClientRect();
      const down = e.deltaY > 0;
      // inside a tall section: scroll natively until its far edge is (nearly) on screen
      if (down ? r.bottom > innerHeight + SLACK : r.top < hdr - SLACK) return;
      const next = els[i + (down ? 1 : -1)];
      if (!next) return; // past the last section the footer scrolls natively
      e.preventDefault();
      const now = performance.now();
      // trackpad inertia keeps firing after the page turn: hold the lock until it goes quiet
      if (now < lockUntil) {
        lockUntil = Math.max(lockUntil, now + 160);
        return;
      }
      lockUntil = now + SETTLE_MS;
      const top = scrollY + next.getBoundingClientRect().top - hdr;
      scrollTo({ top: down ? top : top + Math.max(0, next.offsetHeight - view), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    addEventListener('wheel', onWheel, { passive: false });
    return () => {
      removeEventListener('wheel', onWheel);
      io.disconnect();
      root.classList.remove('snap', 'js-pop');
    };
  }, []);
  return null;
}
