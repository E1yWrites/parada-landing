'use client';
// The demo: one stop per page turn, each card popping in as it lands. CSS scroll snap handles touch and the scrollbar; a
// mouse wheel notch is too small for mandatory snap to leave a tall section (it snaps back), so wheel input pages one
// section at a time here, and so does the keyboard (PageDown/PageUp, arrows, Space). A section taller than the screen
// scrolls natively until its edge, then pages on.
import { useEffect } from 'react';

const SETTLE_MS = 650;
const SLACK = 48; // px a section may overflow the screen and still page on the first turn
const NEXT = new Set(['PageDown', 'ArrowDown', 'ArrowRight', ' ']);
const PREV = new Set(['PageUp', 'ArrowUp', 'ArrowLeft']);

export default function SnapPop() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('snap', 'js-pop');
    const els = [...document.querySelectorAll<HTMLElement>('[data-snap]')];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-in', e.intersectionRatio > 0.5)), {
      threshold: [0, 0.5, 1],
    });
    els.forEach((el) => io.observe(el));

    const header = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    // the section under the reading line
    const current = () => {
      const hdr = header();
      const mid = hdr + (innerHeight - hdr) / 2;
      return els.findIndex((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
    };
    let lockUntil = 0;
    // Turn one page. Returns false when the turn is left to the browser (inside a tall section, or past the last stop).
    const page = (down: boolean) => {
      const hdr = header();
      const view = innerHeight - hdr;
      const i = current();
      if (i < 0) return false; // footer: native scroll
      const r = els[i].getBoundingClientRect();
      // inside a tall section: scroll natively until its far edge is (nearly) on screen
      if (down ? r.bottom > innerHeight + SLACK : r.top < hdr - SLACK) return false;
      const next = els[i + (down ? 1 : -1)];
      if (!next) return false; // past the last section the footer scrolls natively
      const now = performance.now();
      // trackpad inertia keeps firing after the page turn: hold the lock until it goes quiet
      if (now < lockUntil) {
        lockUntil = Math.max(lockUntil, now + 160);
        return true;
      }
      lockUntil = now + SETTLE_MS;
      const top = scrollY + next.getBoundingClientRect().top - hdr;
      scrollTo({ top: down ? top : top + Math.max(0, next.offsetHeight - view), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return true;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || root.classList.contains('is-driving') || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (page(e.deltaY > 0)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || root.classList.contains('is-driving')) return;
      const t = e.target as HTMLElement;
      // typing, radio arrows and a focused control's Space keep their own meaning
      if (t.closest('input, select, textarea, [contenteditable="true"]') || (e.key === ' ' && t.closest('a, button, summary'))) return;
      const down = NEXT.has(e.key) && !(e.key === ' ' && e.shiftKey);
      if (!down && !PREV.has(e.key) && !(e.key === ' ' && e.shiftKey)) return;
      // a lock still settling swallows the key, so a held key or a double click turns one page, not two
      if (page(down)) e.preventDefault();
    };
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      io.disconnect();
      root.classList.remove('snap', 'js-pop');
    };
  }, []);
  return null;
}
