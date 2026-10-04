// Stylised LPU-Batangas campus, laid out from the user's photos as a one-way U:
// street → ENTRY gate → tree avenue (Zone A) → open lot with carports (Zone B)
// → main-building front (Zone C) → EXIT gate → street. Both gates face the street.
// Zone counts are the demo figures from lib/content.ts. Axes: +x east, +z south (street side), metres.
import * as THREE from 'three';
import { ZONES } from '@/lib/content';
import type { CityModel } from './kit';

export const SLOT_W = 2.7;
export const SLOT_D = 5.2;
export const ROAD_W = 7.5;

// Loop centre lines
export const WEST_X = -48; // left leg, northbound
export const EAST_X = 48; // right leg, southbound
export const BASE_Z = -46; // base, eastbound
export const WALL_Z = 42; // street-side wall, gates sit in it
export const STREET_Z = 50;

export const ENTRY = new THREE.Vector3(WEST_X, 0, WALL_Z);
export const EXIT = new THREE.Vector3(EAST_X, 0, WALL_Z);

export type Slot = { x: number; z: number; rot: number }; // rot: heading of the parked car's nose (radians, 0 = +z)
type Row = { x0: number; z0: number; dx: number; dz: number; count: number; rot: number };

const E = Math.PI / 2; // nose east
const W = -Math.PI / 2; // nose west
const N = Math.PI; // nose north
const S = 0; // nose south
const off = ROAD_W / 2 + SLOT_D / 2; // road centre → slot centre

const ROWS: Record<'A' | 'B' | 'C', Row[]> = {
  // Zone A: both kerbs of the tree avenue, nose-in
  A: [
    { x0: WEST_X + off, z0: 30, dx: 0, dz: -SLOT_W, count: 15, rot: E },
    { x0: WEST_X - off, z0: 30, dx: 0, dz: -SLOT_W, count: 15, rot: W },
  ],
  // Zone B: open lot along the base, carports over the north row
  B: [
    { x0: -32.4, z0: BASE_Z - off, dx: SLOT_W, dz: 0, count: 25, rot: N },
    { x0: -32.4, z0: BASE_Z + off, dx: SLOT_W, dz: 0, count: 25, rot: S },
  ],
  // Zone C: in front of the main building, both kerbs
  C: [
    { x0: EAST_X + off, z0: -24, dx: 0, dz: SLOT_W, count: 20, rot: E },
    { x0: EAST_X - off, z0: -24, dx: 0, dz: SLOT_W, count: 20, rot: W },
  ],
};

export const zoneLayout = ZONES.map((z) => {
  const slots: Slot[] = ROWS[z.code].flatMap((r) =>
    Array.from({ length: r.count }, (_, i) => ({ x: r.x0 + r.dx * (i + 0.5), z: r.z0 + r.dz * (i + 0.5), rot: r.rot })),
  );
  const xs = slots.map((s) => s.x);
  const zs = slots.map((s) => s.z);
  const pad = SLOT_D / 2 + 0.5;
  const box = { x0: Math.min(...xs) - pad, x1: Math.max(...xs) + pad, z0: Math.min(...zs) - pad, z1: Math.max(...zs) + pad };
  return { ...z, slots, rows: ROWS[z.code], box, center: new THREE.Vector3((box.x0 + box.x1) / 2, 0, (box.z0 + box.z1) / 2) };
});
export type ZoneLayout = (typeof zoneLayout)[number];

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
export const TAKEN = zoneLayout.map((z, i) => new Set(takenSlots(z.capacity, z.occupied, 11 + i)));

// The demo car takes the free east-kerb Zone A slot nearest the entry gate.
const zoneA = zoneLayout[0];
const demoIdx = zoneA.slots.findIndex((s, i) => s.rot === E && !TAKEN[0].has(i));
export const DEMO_SLOT = zoneA.slots[demoIdx];

const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const curve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, 'centripetal');
const LANE = 1.6; // keep right of the centre line

export const PATHS = {
  // along the street → turns into the entry apron, stops at the gate camera
  arrive: curve([v(-130, STREET_Z + LANE), v(-80, STREET_Z + LANE), v(-58, STREET_Z + 1), v(WEST_X, STREET_Z - 3), v(WEST_X, WALL_Z + 4.5)]),
  // through the gate, up the avenue, nose-in to the free slot
  park: curve([v(WEST_X, WALL_Z + 4.5), v(WEST_X, WALL_Z - 4), v(WEST_X - 0.5, DEMO_SLOT.z + 6), v(WEST_X + 1.5, DEMO_SLOT.z + 1.8), v(DEMO_SLOT.x, DEMO_SLOT.z)]),
  // reverse out, swinging the tail south
  reverse: curve([v(DEMO_SLOT.x, DEMO_SLOT.z), v(WEST_X + 2.5, DEMO_SLOT.z + 1.2), v(WEST_X, DEMO_SLOT.z + 4.5)]),
  // the rest of the U: avenue → base → main-building front → exit camera
  leave: curve([
    v(WEST_X, DEMO_SLOT.z + 4.5),
    v(WEST_X, DEMO_SLOT.z - 2),
    v(WEST_X, BASE_Z + 8),
    v(WEST_X + 4, BASE_Z + 1),
    v(WEST_X + 12, BASE_Z),
    v(EAST_X - 12, BASE_Z),
    v(EAST_X - 1, BASE_Z + 4),
    v(EAST_X, BASE_Z + 12),
    v(EAST_X, WALL_Z - 4.5),
  ]),
  // out of the exit gate, left onto the street
  out: curve([v(EAST_X, WALL_Z - 4.5), v(EAST_X, WALL_Z + 3), v(EAST_X + 4, STREET_Z - 1), v(EAST_X + 20, STREET_Z - LANE), v(EAST_X + 80, STREET_Z - LANE)]),
};

// [centerX, centerZ, sizeX, sizeZ]
export const ROADS: [number, number, number, number][] = [
  [0, STREET_Z, 300, 10], // street
  [WEST_X, (WALL_Z + 4 + BASE_Z) / 2, ROAD_W, WALL_Z + 4 - BASE_Z + ROAD_W / 2], // left leg + entry apron
  [0, BASE_Z, EAST_X - WEST_X + ROAD_W, ROAD_W], // base
  [EAST_X, (WALL_Z + 4 + BASE_Z) / 2, ROAD_W, WALL_Z + 4 - BASE_Z + ROAD_W / 2], // right leg + exit apron
];

// One-way arrows painted on the loop: [x, z, heading]
export const ARROWS: [number, number, number][] = [
  [WEST_X, 34, N], [WEST_X, 0, N], [WEST_X, -30, N],
  [-20, BASE_Z, E], [20, BASE_Z, E],
  [EAST_X, -30, S], [EAST_X, 0, S], [EAST_X, 34, S],
];

export type Building = { x: number; z: number; w: number; d: number; floors: number; color: string; trim: string };
export const FLOOR_H = 3.6;
export const BUILDINGS: Record<'laurel' | 'core' | 'main' | 'hall', Building> = {
  laurel: { x: -74, z: -4, w: 16, d: 56, floors: 3, color: '#e9e1cf', trim: '#2f7a4c' }, // green-railed block along the avenue (photos 2–3)
  core: { x: 0, z: -12, w: 50, d: 18, floors: 4, color: '#f1ede4', trim: '#8a7f6e' }, // academic block inside the U
  main: { x: 78, z: -6, w: 18, d: 60, floors: 6, color: '#f4f2ec', trim: '#9aa3ad' }, // main building with round tower (photos 5–6)
  hall: { x: 0, z: -70, w: 40, d: 12, floors: 2, color: '#ddd5c4', trim: '#7b6d58' }, // hall behind the open lot
};
export const TOWER = { x: 69, z: 26, r: 6, floors: 6 }; // round corner tower of the main building
export const PAVILION = { x: -14, z: 22, w: 14, d: 9 }; // covered pavilion inside the U (photo 4)

// Kenney City Builder pieces placed round the campus: [model, x, z, scale (m per tile), heading]
export type Prop = [CityModel, number, number, number, number];
const rng = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;
const tree = (x: number, z: number, i: number, s = 8.5): Prop => [rng(i) > 0.45 ? 'grass-trees-tall' : 'grass-trees', x, z, s * (0.9 + rng(i + 7) * 0.25), Math.floor(rng(i + 3) * 4) * E];
const STREET_ROW = 68; // neighbourhood across the street
const BLOCKS: CityModel[] = ['building-small-a', 'building-small-c', 'building-small-d', 'building-small-b', 'building-small-a', 'building-small-d'];
export const PROPS: Prop[] = [
  // tree avenue along Zone A, both kerbs, running on up the left leg
  ...Array.from({ length: 10 }, (_, i) => tree(WEST_X - off - 6.2, 34 - i * 8, i)),
  ...Array.from({ length: 8 }, (_, i) => tree(WEST_X + off + 5, 30 - i * 8, i + 40, 8)),
  // inside the U and behind the open lot
  ...[[-24, 8], [24, 8], [14, 31], [30, 24], [-28, 34], [-20, -31], [0, -31], [20, -31], [-50, -62], [-30, -62], [30, -62], [50, -62], [-64, -60], [64, -60]].map(([x, z], i) => tree(x, z, i + 80)),
  // countryside beyond the campus wall
  ...Array.from({ length: 24 }, (_, i) => tree((i % 2 ? 1 : -1) * (98 + (i % 4 > 1 ? 12 : 0) + rng(i) * 4), -70 + Math.floor(i / 4) * 20 + rng(i + 1) * 6, i + 120, 10)),
  ...Array.from({ length: 12 }, (_, i) => tree(-110 + i * 20 + rng(i + 9) * 6, -92 - rng(i + 5) * 6, i + 160, 10)),
  ['pavement-fountain', 0, 9, 9, 0],
  // street lamps in pairs along both kerbs, clear of the two gate aprons
  ...Array.from({ length: 14 }, (_, i) => -130 + i * 20)
    .filter((x) => Math.abs(x - WEST_X) > 10 && Math.abs(x - EAST_X) > 10)
    .flatMap((x): Prop[] => [['road-straight-lightposts', x, STREET_Z - 5.6, 8, 0], ['road-straight-lightposts', x + 10, STREET_Z + 5.6, 8, 0]]),
  // shophouses facing the campus; low garages opposite each gate keep the gate views open
  ...Array.from({ length: 28 }, (_, i): Prop => {
    const x = -150 + i * 11;
    const atGate = Math.abs(x - WEST_X) < 10 || Math.abs(x - EAST_X) < 10;
    return [atGate ? 'building-garage' : BLOCKS[i % BLOCKS.length], x, STREET_ROW, 10, N];
  }),
];

export const PALMS: [number, number, number][] = [
  [EAST_X + off + 5, -30, 1], [EAST_X + off + 5, -10, 1.1], [EAST_X + off + 5, 10, 0.95], [EAST_X + off + 6, 34, 1.05],
  [EAST_X - off - 4.5, -16, 1], [EAST_X - off - 4.5, 12, 1.1],
];

export const BOUNDS = { x0: -86, x1: 92, z0: -80, z1: WALL_Z }; // campus wall
export const GATE_GAP = 6; // half-width of each gate opening in the street wall
