// Drive-mode state shared by the 3D scene (writer) and the DOM HUD (reader).
// Discrete events go through set() and re-render subscribers; per-frame values live in `live`.
import { useSyncExternalStore } from 'react';
import { ZONES, DEMO_PLATE } from './content';

export const GUEST_PLATE = 'NBC 4821'; // demo plate for the guest run, not a real registration
export type Plate = 'registered' | 'guest';
export type Policy = 'admit' | 'deny';
export type Step = 'gate' | 'park' | 'exit' | 'done';
export type Toast = { title: string; body?: string; tone: 'info' | 'ok' | 'warn' | 'bad' };
export type Receipt = { plate: string; zone: string; duration: string; rate: string; fee: string };

export type GameState = {
  driving: boolean;
  plate: Plate;
  policy: Policy;
  step: Step;
  denied: boolean; // the guest policy turned the car away at the entry gate
  toast: Toast | null;
  counts: number[];
  parkedZone: number | null;
  sessionStart: number | null;
  receipt: Receipt | null;
  run: number; // bumps on every restart so the scene resets
};

const base = (): GameState => ({
  driving: false,
  plate: 'registered',
  policy: 'admit',
  step: 'gate',
  denied: false,
  toast: null,
  counts: ZONES.map((z) => z.occupied),
  parkedZone: null,
  sessionStart: null,
  receipt: null,
  run: 0,
});

let state = base();
const subs = new Set<() => void>();

export const live = { speed: 0, elapsed: 0 }; // km/h, seconds since admission
export const input = { up: false, down: false, left: false, right: false, brake: false };

export const plateText = (p: Plate) => (p === 'registered' ? DEMO_PLATE : GUEST_PLATE);

export const game = {
  get: () => state,
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    // the zone tags in the 3D scene are plain DOM; keep them in step with the counts
    if (patch.counts) patch.counts.forEach((n, i) => {
      const el = document.getElementById(`zone-count-${ZONES[i].code}`);
      if (el) el.textContent = `${n} / ${ZONES[i].capacity}`;
    });
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
  start() {
    game.set({ ...base(), driving: true, plate: state.plate, policy: state.policy, run: state.run + 1 });
  },
  stop() {
    game.set({ ...base(), plate: state.plate, policy: state.policy, run: state.run + 1 });
    Object.assign(input, { up: false, down: false, left: false, right: false, brake: false });
  },
  setCount(zone: number, n: number) {
    if (state.counts[zone] === n) return;
    const counts = state.counts.slice();
    counts[zone] = n;
    game.set({ counts });
  },
};

export const useGame = () => useSyncExternalStore(game.subscribe, game.get, game.get);

export const fmtDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
