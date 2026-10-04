// Drive-mode state shared by the 3D scene (writer) and the DOM HUD (reader).
// Discrete events go through set() and re-render subscribers; per-frame values live in `live`.
//
// The rules follow the PARADA backend (E1yWrites/parada, services/api/src/domain/occupancy.ts): occupancy
// changes only when a zone's gate camera accepts an ENTRY or EXIT event; a session opens on entry and closes,
// with its fee, on exit through the same zone's gates. Slots never change a count.
import { useSyncExternalStore } from 'react';
import { ZONES, DEMO_PLATE } from './content';
import type { Plate, Policy } from './rules';

export { admit, GUEST_ZONE, type Plate, type Policy } from './rules';

export const GUEST_PLATE = 'NBC 4821'; // demo plate for the guest run, not a real registration
export type Toast = { title: string; body?: string; tone: 'info' | 'ok' | 'warn' | 'bad' };
export type Receipt = { plate: string; zone: string; duration: string; rate: string; fee: string; camera: string };
export type Session = { zone: number; start: number; camera: string };

export type GameState = {
  driving: boolean;
  plate: Plate;
  policy: Policy;
  session: Session | null; // the car's open parking session, if any
  denied: string | null; // why the last gate turned the car away (cleared when it drives off)
  toast: Toast | null;
  counts: number[];
  receipt: Receipt | null;
  run: number; // bumps on every restart so the scene resets
};

const base = (): GameState => ({
  driving: false,
  plate: 'registered',
  policy: 'primary',
  session: null,
  denied: null,
  toast: null,
  counts: ZONES.map((z) => z.occupied),
  receipt: null,
  run: 0,
});

let state = base();
const subs = new Set<() => void>();

export const live = { speed: 0, elapsed: 0 }; // km/h, seconds since the session opened
export const input = { up: false, down: false, left: false, right: false, brake: false };

export const plateText = (p: Plate) => (p === 'registered' ? DEMO_PLATE : GUEST_PLATE);

export const game = {
  get: () => state,
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    // the zone tags in the 3D scene are plain DOM; keep them in step with the counts
    if (patch.counts && typeof document !== 'undefined')
      patch.counts.forEach((n, i) => {
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
