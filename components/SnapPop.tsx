'use client';
// Home page only: the deck. One section per page turn, each section's card popping in as it lands, and a slide
// counter for the panel ("back to slide 7") that also takes a number: click it, or just type the digits anywhere, then
// Enter. A jump fades the stage and cuts the camera to the slide instead of panning there (state.ts). CSS scroll snap handles touch and the scrollbar; a mouse wheel notch is
// too small for mandatory snap to leave a tall section (it snaps back), so wheel input pages one section at a time
// here, and so do presentation clickers and the keyboard (PageDown/PageUp, arrows, Space). A section taller than
// the screen scrolls natively until its edge, then pages on.
import { useEffect, useRef, useState } from 'react';
import { startCut, FADE_MS } from './scene/state';

const SETTLE_MS = 650;
const SLACK = 48; // px a section may overflow the screen and still page on the first turn
const NEXT = new Set(['PageDown', 'ArrowDown', 'ArrowRight', ' ']);
const PREV = new Set(['PageUp', 'ArrowUp', 'ArrowLeft']);

export default function SnapPop() {
  const [slide, setSlide] = useState<[number, number] | null>(null);
  const [typed, setTyped] = useState<string | null>(null); // digits on their way to a jump, shown in the counter
  const go = useRef<(n: number) => void>(() => {});
  const field = useRef<HTMLInputElement>(null);
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
    // Turn one page. Returns false when the turn is left to the browser (inside a tall section, or past the deck).
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
    // jump to slide n: fade, then land there in one step (no fade without the 3D stage, or under reduced motion)
    go.current = (n: number) => {
      const el = els[Math.min(els.length, Math.max(1, Math.round(n))) - 1];
      const land = () => scrollTo({ top: scrollY + el.getBoundingClientRect().top - header(), behavior: 'instant' });
      lockUntil = performance.now() + SETTLE_MS + FADE_MS;
      if (root.dataset.webgl !== 'on' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        land();
        return;
      }
      startCut();
      setTimeout(land, FADE_MS);
    };
    let digits = '';
    let clear = 0;
    const type = (d: string) => {
      digits = d.slice(0, 2);
      setTyped(digits || null);
      clearTimeout(clear);
      if (digits) clear = window.setTimeout(() => type(''), 3000); // a stray digit forgets itself
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
      // a slide number typed anywhere, PowerPoint style: digits, then Enter (Backspace edits, Escape drops it)
      const typing = /^[0-9]$/.test(e.key) || (digits !== '' && ['Enter', 'Backspace', 'Escape'].includes(e.key));
      if (typing) {
        if (e.key !== 'Escape') e.preventDefault();
        if (e.key === 'Enter') go.current(Number(digits));
        type(e.key === 'Backspace' ? digits.slice(0, -1) : /^[0-9]$/.test(e.key) ? digits + e.key : '');
        return;
      }
      const down = NEXT.has(e.key) && !(e.key === ' ' && e.shiftKey);
      if (!down && !PREV.has(e.key) && !(e.key === ' ' && e.shiftKey)) return;
      // a lock still settling swallows the key, so a held key or a double click turns one page, not two
      if (page(down)) e.preventDefault();
    };
    // the counter follows whichever section crosses the middle of the screen
    const line = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setSlide([els.indexOf(e.target as HTMLElement) + 1, els.length])), {
      rootMargin: '-50% 0px -50% 0px',
    });
    els.forEach((el) => line.observe(el));
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      line.disconnect();
      io.disconnect();
      clearTimeout(clear);
      root.classList.remove('snap', 'js-pop');
    };
  }, []);
  if (!slide) return null;
  return (
    <form
      className="slide-count"
      title="Type a slide number, then Enter"
      data-typing={typed !== null || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (typed) go.current(Number(typed));
        field.current?.blur();
      }}
    >
      <label>
        <span className="sr-only">Slide number, of {slide[1]}. Type a number and press Enter to go there.</span>
        <input
          ref={field}
          className="num"
          inputMode="numeric"
          enterKeyHint="go"
          autoComplete="off"
          maxLength={2}
          value={typed ?? String(slide[0]).padStart(2, '0')}
          onFocus={() => setTyped('')}
          onBlur={() => setTyped(null)}
          onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
        />
      </label>
      <span className="num" aria-hidden="true">
        / {slide[1]}
      </span>
    </form>
  );
}
