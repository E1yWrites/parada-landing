// Shared, non-React state between the camera rig and scene parts (read every frame).
import type { GateId } from './layout';

export const scroll = {
  t: 0, // smoothed float index into `keys`: 3.4 = 40% of the way from stop 3 to stop 4
  keys: [] as string[],
};

export const stopIndex = (key: string) => scroll.keys.indexOf(key);

// 0..1 weight for "near this stop", used to fade per-chapter effects in and out.
export const near = (key: string, radius = 0.75) => {
  const i = stopIndex(key);
  if (i < 0) return 0;
  return Math.max(0, 1 - Math.abs(scroll.t - i) / radius);
};

// Animated gate parts (0..1): boom raised, scan cone toward a car arriving (entry) or leaving (exit).
// Written by the scroll tour or by drive mode, drawn by <Gates>.
export const gates: Record<GateId, { boom: number; cone: number; coneOut: number }> = {
  main: { boom: 0, cone: 0, coneOut: 0 },
  north: { boom: 0, cone: 0, coneOut: 0 },
};
export const resetGates = () => Object.values(gates).forEach((g) => Object.assign(g, { boom: 0, cone: 0, coneOut: 0 }));

// Where the tour car is, so the camera can follow it.
export const demoCar = { pos: { x: 0, y: 0, z: 0 }, heading: 0, visible: false };
