'use client';
// Starts drive mode. Hidden until WebGL is confirmed (html[data-webgl=on]); the page works without it.
import { useId } from 'react';
import { game, useGame, plateText, type Plate, type Policy } from '@/lib/game';

let opener: HTMLElement | null = null;
export const returnFocus = () => opener?.focus({ preventScroll: true });

const start = (e: React.MouseEvent<HTMLButtonElement>) => {
  opener = e.currentTarget;
  game.start();
};

export function DriveIn({ label = 'Drive in' }: { label?: string }) {
  return (
    <button type="button" className="btn primary needs-webgl" onClick={start}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M5 11h14" />
        <circle cx="8" cy="13.5" r=".6" fill="currentColor" />
        <circle cx="16" cy="13.5" r=".6" fill="currentColor" />
      </svg>
      {label}
    </button>
  );
}

function Choice<T extends string>({ legend, value, options, onPick }: { legend: string; value: T; options: [T, string, string?][]; onPick: (v: T) => void }) {
  const name = useId(); // the page and the HUD both mount a picker; each needs its own radio group
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      {options.map(([v, label, hint]) => (
        <label key={v}>
          <input type="radio" name={name} checked={value === v} onChange={() => onPick(v)} />
          <span>
            {label}
            {hint && <small>{hint}</small>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

// Plate + guest policy, then DRIVE IN. Also shown on the HUD while the car waits at the gate.
export function DriveSetup({ compact = false }: { compact?: boolean }) {
  const { plate, policy } = useGame();
  return (
    <div className={compact ? 'setup compact' : 'setup'}>
      <Choice<Plate>
        legend="Plate"
        value={plate}
        onPick={(p) => game.set({ plate: p })}
        options={[
          ['registered', 'Registered', plateText('registered')],
          ['guest', 'Guest', plateText('guest')],
        ]}
      />
      <Choice<Policy>
        legend="Guest policy"
        value={policy}
        onPick={(p) => game.set({ policy: p })}
        options={[
          ['admit', 'Admit guests'],
          ['deny', 'Deny guests'],
        ]}
      />
    </div>
  );
}
