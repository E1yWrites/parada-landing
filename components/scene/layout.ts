// Lot geometry shared by every scene part. Zones sit side by side, fronts on z = 0,
// rows extending into -z; the access road runs along +z.
import { ZONES } from '@/lib/content';

export const SLOT_W = 2.6;
export const SLOT_D = 5;
export const ROW_GAP = 6.5; // slot depth + aisle
export const PER_ROW = 10;
export const ZONE_W = PER_ROW * SLOT_W;
export const ROAD_Z = 7;

const ZONE_X = { A: -32, B: 0, C: 32 } as const;

export const zoneLayout = ZONES.map((z) => {
  const rows = Math.ceil(z.capacity / PER_ROW);
  const x = ZONE_X[z.code];
  const depth = rows * ROW_GAP + 2;
  const slots = Array.from({ length: z.capacity }, (_, i) => {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    return [x - ZONE_W / 2 + SLOT_W / 2 + col * SLOT_W, -(4 + row * ROW_GAP)] as [number, number];
  });
  return { ...z, x, rows, depth, centerZ: -depth / 2, slots, gate: [x, 0, 1.5] as [number, number, number] };
});

// Deterministic "which slots are taken" so SSR snapshots and every visit look the same.
export const takenSlots = (capacity: number, occupied: number, seed: number) => {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const idx = Array.from({ length: capacity }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, occupied);
};
