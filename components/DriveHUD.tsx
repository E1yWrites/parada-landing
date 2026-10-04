'use client';
// Drive-mode overlay: objective, plate, zone tally, session timer, speed, toasts, touch pad, receipt.
// Keyboard: WASD / arrows drive, Space handbrake, H horn, R restart, Esc leave.
import { useEffect, useRef, useState } from 'react';
import { ZONES, band } from '@/lib/content';
import { sound } from '@/lib/sfx';
import { game, input, live, plateText, fmtDuration, useGame } from '@/lib/game';
import { DriveSetup, returnFocus } from './DriveIn';

const KEYS: Record<string, keyof typeof input> = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', Space: 'brake',
};

// What to do next, from the state the gate cameras left behind.
const objective = (g: ReturnType<typeof game.get>) =>
  g.denied ??
  (g.session
    ? `Counted into ${ZONES[g.session.zone].name}. Park in any bay, then leave through the north gate on Doña Aurelia St.`
    : g.receipt
      ? 'Session closed. Go round again, or leave.'
      : 'Drive north to the curved canopy at the corner ahead: Zone A’s entry camera.');

const leave = () => {
  game.stop();
  requestAnimationFrame(returnFocus);
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Hold-to-press touch button bound to one input flag.
function Pad({ k, label, d }: { k: keyof typeof input; label: string; d: string }) {
  const set = (v: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    input[k] = v;
  };
  return (
    <button type="button" className={`pad pad-${k}`} aria-label={label} onPointerDown={set(true)} onPointerUp={set(false)} onPointerCancel={set(false)} onPointerLeave={set(false)} onContextMenu={(e) => e.preventDefault()}>
      <Icon d={d} />
    </button>
  );
}

export default function DriveHUD() {
  const g = useGame();
  const speed = useRef<HTMLSpanElement>(null);
  const timer = useRef<HTMLSpanElement>(null);
  const again = useRef<HTMLButtonElement>(null);
  const [toast, setToast] = useState(g.toast);
  const [shown, setShown] = useState<typeof g.receipt>(null); // receipt open on screen

  // page chrome steps aside while driving
  useEffect(() => {
    document.documentElement.classList.toggle('is-driving', g.driving);
    return () => document.documentElement.classList.remove('is-driving');
  }, [g.driving]);

  // keyboard
  useEffect(() => {
    if (!g.driving) return;
    const down = (e: KeyboardEvent) => {
      if (document.querySelector('.hud-done')) return; // the receipt has the keyboard
      const k = KEYS[e.code];
      if (k) {
        input[k] = true;
        e.preventDefault();
      } else if (e.code === 'Escape') leave();
      else if (e.code === 'KeyH' && !e.repeat) sound.play('horn');
      else if (e.code === 'KeyR' && !e.repeat) game.start();
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (k) input[k] = false;
    };
    const blur = () => Object.keys(input).forEach((k) => (input[k as keyof typeof input] = false));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [g.driving]);

  // speed + timer are per-frame values; write them straight to the DOM
  useEffect(() => {
    if (!g.driving) return;
    let raf = 0;
    const tick = () => {
      if (speed.current) speed.current.textContent = String(Math.round(live.speed)).padStart(2, '0');
      if (timer.current) timer.current.textContent = game.get().session ? fmtDuration(live.elapsed) : '--:--';
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [g.driving]);

  // toasts linger a few seconds; the latest replaces the last
  useEffect(() => {
    setToast(g.toast);
    if (!g.toast) return;
    const t = setTimeout(() => setToast(null), g.toast.tone === 'bad' ? 7000 : 4200);
    return () => clearTimeout(t);
  }, [g.toast]);

  // an exit camera closing the session opens the receipt; the car stops while it's read
  useEffect(() => {
    if (!g.receipt) return;
    setShown(g.receipt);
    Object.keys(input).forEach((k) => (input[k as keyof typeof input] = false));
  }, [g.receipt]);
  useEffect(() => {
    if (shown) again.current?.focus();
  }, [shown]);
  useEffect(() => {
    if (!g.driving) setShown(null);
  }, [g.driving]);

  if (!g.driving) return null;
  const r = shown;
  return (
    <div className="hud" role="region" aria-label="Drive mode">
      <div className="hud-top">
        <div className="hud-left">
          <section className="board hud-goal" data-blocked={g.denied || undefined}>
            <span className="plate num">{plateText(g.plate)}</span>
            <p>{objective(g)}</p>
            {!g.session && <DriveSetup compact />}
          </section>
          <div className="hud-toast" aria-live="polite">
            {toast && (
              <div key={toast.title} className="board toast" data-tone={toast.tone}>
                <b>{toast.title}</b>
                {toast.body && <span>{toast.body}</span>}
              </div>
            )}
          </div>
        </div>

        <section className="board hud-meter" aria-label="Trip">
          <ul className="tally" aria-label="Zone occupancy (demo figures)">
            {ZONES.map((z, i) => (
              <li key={z.code} data-band={band({ ...z, occupied: g.counts[i] })} className={g.session?.zone === i ? 'is-mine' : undefined}>
                <b>{z.code}</b>
                <span className="num">
                  {g.counts[i]}/{z.capacity}
                </span>
              </li>
            ))}
          </ul>
          <dl className="gauges">
            <div>
              <dt>Session</dt>
              <dd className="num">
                <span ref={timer}>{g.session ? fmtDuration(live.elapsed) : '--:--'}</span>
              </dd>
            </div>
            <div>
              <dt>km/h</dt>
              <dd className="num">
                <span ref={speed}>00</span>
              </dd>
            </div>
          </dl>
          <button type="button" className="btn small" onClick={leave}>
            Leave <kbd>Esc</kbd>
          </button>
        </section>
      </div>

      <p className="hud-keys">
        <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd> drive · <kbd>Space</kbd> handbrake · <kbd>H</kbd> horn · <kbd>R</kbd> restart
      </p>
      <div className="hud-pads">
        <div>
          <Pad k="left" label="Steer left" d="M15 5l-7 7 7 7" />
          <Pad k="right" label="Steer right" d="M9 5l7 7-7 7" />
        </div>
        <div>
          <Pad k="down" label="Brake / reverse" d="M6 9l6 6 6-6" />
          <Pad k="up" label="Accelerate" d="M6 15l6-6 6 6" />
        </div>
      </div>

      {r && (
        <div className="hud-done">
          <section className="receipt" aria-labelledby="receipt-title">
            <h2 id="receipt-title">Session closed</h2>
            <span className="stamped" aria-hidden="true">
              Exited
              <small>{r.camera}</small>
            </span>
            <dl>
              <dt>Plate</dt>
              <dd>{r.plate}</dd>
              <dt>Zone</dt>
              <dd>{r.zone}</dd>
              <dt>Duration</dt>
              <dd>{r.duration}</dd>
              <dt>Rate</dt>
              <dd>{r.rate}</dd>
              <dt>Fee</dt>
              <dd>{r.fee}</dd>
            </dl>
            <p>
              Camera <span className="num">{r.camera}</span> read the plate as you left. The backend closed the session, released
              the space in the zone count and calculated the fee where configured.
            </p>
            <div className="actions">
              <button ref={again} type="button" className="btn primary" onClick={() => setShown(null)}>
                Keep driving
              </button>
              <button type="button" className="btn" onClick={() => game.start()}>
                Start over
              </button>
              <button type="button" className="btn" onClick={leave}>
                Back to the tour
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
