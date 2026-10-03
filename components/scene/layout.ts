// Stylised LPU-Batangas campus, laid out from the user's walk-through photos:
// main gate → tree-lined avenue → pavilion → carports → main building loop → service road → exit gate.
// Shapes are simplified; only the route order is taken from the photos.
// Zone counts are the demo figures from lib/content.ts. Axes: +x east, -z north, metres.
import * as THREE from 'three';
import { ZONES } from '@/lib/content';

export const SLOT_W = 2.6;
export const SLOT_D = 5;
export const ROAD_W = 7;

// Road centre lines
export const AVENUE_Z = 18; // west → east, from the main gate
export const NORTH_X = 0; // south → north, past the pavilion
export const FRONT_Z = -26; // west → east, in front of the main building to the exit gate

export const MAIN_GATE = new THREE.Vector3(-58, 0, AVENUE_Z);
export const EXIT_GATE = new THREE.Vector3(74, 0, FRONT_Z);

type Row = { x0: number; z: number; count: number; facing: 1 | -1 }; // facing: +1 = nose toward +z
const ROWS: Record<'A' | 'B' | 'C', Row[]> = {
  // Zone A: both sides of the tree avenue, just inside the main gate
  A: [
    { x0: -52, z: AVENUE_Z - 6.5, count: 15, facing: -1 },
    { x0: -52, z: AVENUE_Z + 6.5, count: 15, facing: 1 },
  ],
  // Zone B: open lot east of the pavilion road
  B: [12, 4.5, -3, -10.5, -18].map((z) => ({ x0: 6, z, count: 10, facing: 1 as const })),
  // Zone C: carport rows on the east side
  C: [10, 2.5, -5, -12.5].map((z) => ({ x0: 40, z, count: 10, facing: 1 as const })),
};

export const zoneLayout = ZONES.map((z) => {
  const slots = ROWS[z.code].flatMap((r) =>
    Array.from({ length: r.count }, (_, i) => ({ x: r.x0 + SLOT_W / 2 + i * SLOT_W, z: r.z, facing: r.facing })),
  );
  const xs = slots.map((s) => s.x);
  const zs = slots.map((s) => s.z);
  const box = { x0: Math.min(...xs) - 2, x1: Math.max(...xs) + 2, z0: Math.min(...zs) - 3.5, z1: Math.max(...zs) + 3.5 };
  return {
    ...z,
    slots,
    rows: ROWS[z.code],
    box,
    center: new THREE.Vector3((box.x0 + box.x1) / 2, 0, (box.z0 + box.z1) / 2),
  };
});

// Deterministic "which slots are taken" so every visit looks the same.
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
export const TAKEN = zoneLayout.map((z, i) => new Set(takenSlots(z.capacity, z.occupied, 7 + i)));

// The demo car parks in the free Zone A slot (south row) closest to the gate.
const zoneA = zoneLayout[0];
const demoIdx = zoneA.slots.findIndex((s, i) => s.facing === 1 && !TAKEN[0].has(i));
export const DEMO_SLOT = zoneA.slots[demoIdx];

const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const curve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, 'centripetal');

export const PATHS = {
  // street → stops at the main gate camera
  arrive: curve([v(-110, AVENUE_Z), v(-85, AVENUE_Z), v(-63, AVENUE_Z)]),
  // through the gate → into the free slot (nose first)
  park: curve([v(-63, AVENUE_Z), v(-52, AVENUE_Z), v(DEMO_SLOT.x - 5, AVENUE_Z + 0.5), v(DEMO_SLOT.x - 0.6, AVENUE_Z + 3.2), v(DEMO_SLOT.x, DEMO_SLOT.z)]),
  // reverse out of the slot back to the avenue
  reverse: curve([v(DEMO_SLOT.x, DEMO_SLOT.z), v(DEMO_SLOT.x + 0.6, AVENUE_Z + 3.2), v(DEMO_SLOT.x + 4, AVENUE_Z + 0.4)]),
  // avenue → pavilion road → main building front → stops at the exit gate camera
  leave: curve([
    v(DEMO_SLOT.x + 4, AVENUE_Z + 0.4),
    v(-12, AVENUE_Z),
    v(-3, AVENUE_Z - 3),
    v(NORTH_X, 6),
    v(NORTH_X, -14),
    v(4, FRONT_Z + 2),
    v(16, FRONT_Z),
    v(EXIT_GATE.x - 6, FRONT_Z),
  ]),
  // through the exit gate onto the street
  out: curve([v(EXIT_GATE.x - 6, FRONT_Z), v(EXIT_GATE.x + 10, FRONT_Z), v(EXIT_GATE.x + 40, FRONT_Z)]),
};

export const ROADS: [number, number, number, number][] = [
  // [centerX, centerZ, sizeX, sizeZ]
  [-60, AVENUE_Z, 120, ROAD_W],
  [NORTH_X, (AVENUE_Z + FRONT_Z) / 2, ROAD_W, AVENUE_Z - FRONT_Z + ROAD_W],
  [55, FRONT_Z, 110, ROAD_W],
];

// [x, z, w, d, h, color]
export const BUILDINGS: [number, number, number, number, number, string][] = [
  [-34, -6, 40, 13, 11, '#c9c2b2'], // J.P. Laurel building, 3 storeys along the avenue
  [18, -43, 52, 20, 22, '#d9d6cf'], // main academic building, 6 storeys
  [61, -43, 22, 20, 14, '#b9b3a6'], // hall / gym beside the service road
];

export const PAVILION = { x: -9, z: -18, w: 10, d: 8 };

// Tree tunnel along the avenue + scattered campus trees: [x, z, scale]
export const TREES: [number, number, number][] = [
  ...Array.from({ length: 12 }, (_, i) => [-55 + i * 3.6, AVENUE_Z + 11, 1 + ((i * 37) % 5) / 10] as [number, number, number]),
  ...Array.from({ length: 10 }, (_, i) => [-53 + i * 4.2, AVENUE_Z - 10.5, 0.9 + ((i * 53) % 4) / 10] as [number, number, number]),
  [-16, -24, 1.2], [-20, -18, 1], [-14, -36, 1.1], [-12, -40, 0.9], [36, -18, 1], [72, 4, 1], [70, 16, 1.2],
  [-60, -30, 1.3], [-50, -36, 1], [-62, 0, 1.1], [30, 26, 1], [44, 26, 1.2], [58, 24, 0.9], [-8, 28, 1.1], [8, 28, 1],
];

export const BOUNDS = { x0: -58, x1: 74, z0: -56, z1: 31 }; // campus wall
