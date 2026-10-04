// LPU-Batangas main campus, modelled from OpenStreetMap (campusData.ts: campus edge, neighbouring buildings)
// and satellite imagery (campus buildings, covered walkways, the loop driveway). Scene frame: metres from the
// campus pin (13.7637974 N, 121.0652952 E), +x east, +z south, rotated 10° so the campus buildings sit on
// the grid.
//
// PARADA logic, as in the app (E1yWrites/parada) and the landing's demo data: every zone is enclosed and its
// count changes only at its gate cameras; bays are layout only. Zone A is the Main Loop round the JPL
// Building: entry camera at the main gate (the curved canopy on the north-west corner, photo 1), exit camera
// at the north gate on Doña Aurelia St (photo 8). Zones B and C are the landing's other demo zones, fenced lots
// with one camera each, both directions. Zone C sits on the campus's real south parking area.
import * as THREE from 'three';
import { ZONES } from '@/lib/content';
import type { CityModel } from './kit';
import { CAMPUS_EDGE, HOUSES } from './campusData';

export const SLOT_W = 2.7;
export const SLOT_D = 5.2;
export const ROAD_W = 7; // campus driveway
export const STREET_T = 10; // one Kenney street tile, metres
export const FLOOR_H = 3.6;

// Headings: the direction a car's nose points (0 = +z south, π/2 = +x east, π = north, -π/2 = west).
export const S = 0;
export const E = Math.PI / 2;
export const N = Math.PI;
export const W = -Math.PI / 2;
export const fwd = (h: number) => new THREE.Vector3(Math.sin(h), 0, Math.cos(h));

type XZ = [number, number];
export type Rect = [number, number, number, number]; // x0, x1, z0, z1
const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const curve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, 'centripetal');
const inRect = ([x0, x1, z0, z1]: Rect, x: number, z: number, pad = 0) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad;

// ---------- public streets (Kenney tiles) ----------
export const WEST_ST = -88; // Tolentino Rd → P. Herrera St
export const NORTH_ST = -76; // Doña Aurelia St (one-way, westbound)
export const EAST_ST = 84; // Gamboa Rd
const HALF_T = STREET_T / 2;

// ---------- gates ----------
// The main gate canopy is a quarter ring round the north-west corner forecourt; cars pass under its middle.
export const CANOPY = { x: -76.7, z: -68.3, r: 17.5, w: 5, opening: 4.6 / 17.5 }; // opening: half-angle kept clear for the road
const MID = Math.PI / 4;
export const LOOP_X = { west: -61, east: 3.5 };

export type GateId = 'main' | 'north' | 'b' | 'c';
export type Gate = {
  id: GateId;
  zone: number; // index into ZONES
  kind: 'entry' | 'exit' | 'both';
  x: number;
  z: number;
  inward: number; // heading of a car driving INTO the zone through this gate
  style: 'canopy' | 'pergola' | 'gantry';
  cam: string; // camera identifier, as in the landing's admin data
};
export const GATES: Record<GateId, Gate> = {
  main: { id: 'main', zone: 0, kind: 'entry', x: CANOPY.x + CANOPY.r * Math.sin(MID), z: CANOPY.z + CANOPY.r * Math.cos(MID), inward: MID, style: 'canopy', cam: 'cam-a-entry' },
  north: { id: 'north', zone: 0, kind: 'exit', x: LOOP_X.east, z: -64.5, inward: S, style: 'pergola', cam: 'cam-a-exit' },
  b: { id: 'b', zone: 1, kind: 'both', x: 79, z: -27, inward: W, style: 'gantry', cam: 'cam-b-entry' },
  c: { id: 'c', zone: 2, kind: 'both', x: -55.5, z: 125.7, inward: E, style: 'gantry', cam: 'cam-c-entry' },
};
export const GATE_LIST = Object.values(GATES);
export const GATE_STOP = 5.5; // a car waits this far from a gate line, outside or inside
export const gateStop = (g: Gate, side: 'out' | 'in') => {
  const k = side === 'out' ? -GATE_STOP : GATE_STOP;
  return v(g.x + Math.sin(g.inward) * k, g.z + Math.cos(g.inward) * k);
};

// Main gate furniture along the canopy arc: stone pillars, the guard booth and yellow-kerbed planters, with the
// road opening left clear so the boom is the only way through.
const arcAt = (h: number): [number, number] => [CANOPY.x + CANOPY.r * Math.sin(h), CANOPY.z + CANOPY.r * Math.cos(h)];
const ROAD_EDGE = (ROAD_W / 2 + 1.3) / CANOPY.r;
type ArcItem = { x: number; z: number; h: number };
const onArc = (h: number): ArcItem => {
  const [x, z] = arcAt(h);
  return { x, z, h };
};
export const CANOPY_PILLARS: ArcItem[] = [0.09, MID - ROAD_EDGE, MID + ROAD_EDGE, E - 0.42, E - 0.09].map(onArc);
export const CANOPY_BOOTH: ArcItem = onArc(0.34);
export const CANOPY_PLANTERS: ArcItem[] = [];
for (let h = 0.03; h < E - 0.02; h += 2.2 / CANOPY.r) {
  const p = onArc(h);
  if (Math.abs(h - MID) < CANOPY.opening) continue;
  if ([...CANOPY_PILLARS, CANOPY_BOOTH].some((q) => Math.hypot(q.x - p.x, q.z - p.z) < (q === CANOPY_BOOTH ? 2.7 : 1.6))) continue;
  CANOPY_PLANTERS.push(p);
}

// ---------- Zone A's loop driveway ----------
// Centreline from the canopy round the JPL Building to Doña Aurelia St, after the OSM service road (way 920638979).
const G = GATES.main;
const LOOP_PTS: XZ[] = [
  [G.x - Math.sin(MID) * 2, G.z - Math.cos(MID) * 2],
  [G.x, G.z],
  [-62, -49.5],
  [LOOP_X.west, -40],
  [LOOP_X.west, 22],
  [-59.5, 33],
  [-54, 40],
  [-41, 46],
  [-25, 49.5],
  [-12, 48.5],
  [-2, 43.5],
  [2.6, 34],
  [LOOP_X.east, 22],
  [LOOP_X.east, -40],
  [LOOP_X.east, GATES.north.z],
  [LOOP_X.east, NORTH_ST + HALF_T],
];
export const LOOP_CURVE = curve(LOOP_PTS.map(([x, z]) => v(x, z)));
// sampled centreline with unit tangents, for distance / direction tests
export const LOOP_SAMPLES = Array.from({ length: 401 }, (_, i) => {
  const u = i / 400;
  const p = LOOP_CURVE.getPointAt(u);
  const t = LOOP_CURVE.getTangentAt(u);
  return { x: p.x, z: p.z, tx: t.x, tz: t.z, u };
});
/** Nearest point of the loop centreline: distance and the travel direction there. */
export const nearestLoop = (x: number, z: number) => {
  let best = LOOP_SAMPLES[0];
  let d2 = Infinity;
  for (const s of LOOP_SAMPLES) {
    const d = (s.x - x) ** 2 + (s.z - z) ** 2;
    if (d < d2) [d2, best] = [d, s];
  }
  return { d: Math.sqrt(d2), ...best };
};
// One-way arrows painted on the loop: [x, z, heading]
export const ARROWS: [number, number, number][] = [0.13, 0.22, 0.31, 0.42, 0.55, 0.66, 0.76, 0.86].map((u) => {
  const p = LOOP_CURVE.getPointAt(u);
  const t = LOOP_CURVE.getTangentAt(u);
  return [p.x, p.z, Math.atan2(t.x, t.z)];
});
// The forecourt under the canopy: a paved disc that also aprons onto both streets.
export const FORECOURT = { x: CANOPY.x, z: CANOPY.z, r: CANOPY.r - CANOPY.w / 2 + 1 };

// ---------- zones (bays are layout only; capacity is the authority) ----------
export type Slot = { x: number; z: number; rot: number };
// Rows along z start at z0 (edge) and sit at x0 (centre); rows along x start at x0 (edge) and sit at z0 (centre).
type Row = { x0: number; z0: number; dx: number; dz: number; count: number; rot: number };
const offA = ROAD_W / 2 + SLOT_D / 2;
const ROWS: Record<'A' | 'B' | 'C', Row[]> = {
  // Zone A: nose-in bays under the avenue trees (photos 2–4) and along the east leg (photo 6)
  A: [
    { x0: LOOP_X.west - offA, z0: -34, dx: 0, dz: SLOT_W, count: 18, rot: W },
    { x0: LOOP_X.east + offA, z0: -12, dx: 0, dz: SLOT_W, count: 14, rot: E },
  ],
  // Zone B, the east lot: four rows off two aisles, a cross-aisle from the gate; carport over the west pair
  B: [
    { x0: 46.1, z0: -41.5, dx: 0, dz: SLOT_W, count: 11, rot: W },
    { x0: 57.3, z0: -41.5, dx: 0, dz: SLOT_W, count: 4, rot: E },
    { x0: 57.3, z0: -23.3, dx: 0, dz: SLOT_W, count: 5, rot: E },
    { x0: 62.5, z0: -41.5, dx: 0, dz: SLOT_W, count: 4, rot: W },
    { x0: 62.5, z0: -23.3, dx: 0, dz: SLOT_W, count: 5, rot: W },
    { x0: 73.7, z0: -41.5, dx: 0, dz: SLOT_W, count: 4, rot: E },
    { x0: 73.7, z0: -23.3, dx: 0, dz: SLOT_W, count: 5, rot: E },
  ],
  // Zone C, the south lot (OSM way 920639453): two rows of twenty either side of one aisle
  C: [
    { x0: -51.5, z0: 120.1, dx: SLOT_W, dz: 0, count: 20, rot: N },
    { x0: -51.5, z0: 131.3, dx: SLOT_W, dz: 0, count: 20, rot: S },
  ],
};
export const LOTS: Record<'B' | 'C', Rect> = {
  B: [43, 79, -42, -9],
  C: [-55.5, 3, 117, 139],
};
export const CARPORT: Rect = [43.5, 59.9, -41.7, -9.6]; // over Zone B's west rows (the white roof in the imagery)
const TAG_AT: Record<'A' | 'B' | 'C', [number, number]> = { A: [-50, -16], B: [61, -26], C: [-26, 128] }; // A floats over the avenue's JPL side

export const zoneLayout = ZONES.map((z) => {
  const rows = ROWS[z.code];
  const slots: Slot[] = rows.flatMap((r) => Array.from({ length: r.count }, (_, i) => ({ x: r.x0 + r.dx * (i + 0.5), z: r.z0 + r.dz * (i + 0.5), rot: r.rot })));
  const [tx, tz] = TAG_AT[z.code];
  return { ...z, slots, rows, tag: new THREE.Vector3(tx, 0, tz) };
});
export type ZoneLayout = (typeof zoneLayout)[number];

// Deterministic "which bays are taken", in proportion to each zone's count so the lots read like the numbers.
export const takenSlots = (count: number, taken: number, seed: number) => {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const idx = Array.from({ length: count }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, taken);
};
export const TAKEN = zoneLayout.map((z, i) => new Set(takenSlots(z.slots.length, Math.round((z.slots.length * z.occupied) / z.capacity), 11 + i)));

// The tour car takes a free avenue bay part-way down the west leg (any free bay would do).
const zoneA = zoneLayout[0];
export const DEMO_SLOT = zoneA.slots[zoneA.slots.findIndex((s, i) => s.rot === W && s.z > -24 && !TAKEN[0].has(i))];

// ---------- enclosure: hedges round Zones B and C (their gates are the only way in) ----------
const HEDGE = 0.6; // hedge line sits this far outside a lot edge
const GAP = ROAD_W / 2 + 0.7; // half-width of a gate opening
export const HEDGES: [number, number, number, number][] = (() => {
  const [bx0, bx1, bz0, bz1] = LOTS.B;
  const [cx0, cx1, cz0, cz1] = LOTS.C;
  const b = GATES.b;
  const c = GATES.c;
  return [
    [bx0 - HEDGE, bz0 - HEDGE, bx1, bz0 - HEDGE],
    [bx1, bz0 - HEDGE, bx1, b.z - GAP],
    [bx1, b.z + GAP, bx1, bz1 + HEDGE],
    [bx1, bz1 + HEDGE, bx0 - HEDGE, bz1 + HEDGE],
    [bx0 - HEDGE, bz1 + HEDGE, bx0 - HEDGE, bz0 - HEDGE],
    [cx0, cz0 - HEDGE, cx1 + HEDGE, cz0 - HEDGE],
    [cx1 + HEDGE, cz0 - HEDGE, cx1 + HEDGE, cz1 + HEDGE],
    [cx1 + HEDGE, cz1 + HEDGE, cx0, cz1 + HEDGE],
    [cx0, cz1 + HEDGE, cx0, c.z + GAP],
    [cx0, c.z - GAP, cx0, cz0 - HEDGE],
    // Zone C's driveway runs from the street across the campus edge to its gate, hedged both sides
    [-70.5, c.z - GAP, cx0, c.z - GAP],
    [-69.5, c.z + GAP, cx0, c.z + GAP],
  ];
})();

// ---------- paved driveways outside the loop ----------
// [centerX, centerZ, sizeX, sizeZ]
export const DRIVES: [number, number, number, number][] = [
  [(WEST_ST + HALF_T + LOTS.C[0]) / 2, GATES.c.z, LOTS.C[0] - (WEST_ST + HALF_T) + 0.5, ROAD_W], // to Zone C
];

// ---------- street tiles ----------
export type StreetTile = { model: 'road-straight' | 'road-corner' | 'road-split'; x: number; z: number; rot: number; stretch?: number };
const tiles: StreetTile[] = [];
// straight run between two junction centres (exclusive), tiles stretched along the road to fit exactly
const run = (x0: number, z0: number, x1: number, z1: number) => {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const L = len - STREET_T;
  const n = Math.max(1, Math.round(L / STREET_T));
  const ux = (x1 - x0) / len;
  const uz = (z1 - z0) / len;
  for (let i = 0; i < n; i++) {
    const d = HALF_T + (L / n) * (i + 0.5);
    tiles.push({ model: 'road-straight', x: x0 + ux * d, z: z0 + uz * d, rot: Math.abs(ux) > 0.5 ? E : 0, stretch: L / n / STREET_T });
  }
};
const J = {
  w1: [WEST_ST, NORTH_ST], w3: [WEST_ST, GATES.c.z],
  n2: [LOOP_X.east, NORTH_ST], ne: [EAST_ST, NORTH_ST], e2: [EAST_ST, GATES.b.z],
} as const;
// Kit junctions: road-split is open at -x, +x, +z; road-corner joins -x and +z.
tiles.push(
  { model: 'road-split', x: J.w1[0], z: J.w1[1], rot: E },
  { model: 'road-split', x: J.w3[0], z: J.w3[1], rot: E },
  { model: 'road-split', x: J.n2[0], z: J.n2[1], rot: 0 },
  { model: 'road-corner', x: J.ne[0], z: J.ne[1], rot: 0 },
  { model: 'road-split', x: J.e2[0], z: J.e2[1], rot: W },
);
run(WEST_ST, -186, ...J.w1);
run(...J.w1, ...J.w3);
run(...J.w3, WEST_ST, 236);
run(...J.w1, ...J.n2);
run(...J.n2, ...J.ne);
run(...J.ne, ...J.e2);
run(...J.e2, EAST_ST, 236);
export const STREET_TILES = tiles;
// Street corridors [centerX, centerZ, sizeX, sizeZ], for driving and placement tests
export const STREETS: [number, number, number, number][] = [
  [WEST_ST, 25, STREET_T, 422],
  [(WEST_ST + EAST_ST) / 2, NORTH_ST, EAST_ST - WEST_ST + STREET_T, STREET_T],
  [EAST_ST, 80, STREET_T, 322],
];
const STREET_RECTS: Rect[] = STREETS.map(([x, z, w, d]) => [x - w / 2, x + w / 2, z - d / 2, z + d / 2]);

// ---------- buildings (footprints traced from satellite imagery) ----------
export type Block = {
  name: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  floors: number;
  wall: string;
  rails?: string; // balcony rails on one long face (the JPL west wing faces the avenue)
  railsSide?: 'w' | 'e';
  skylights?: boolean;
};
export const BLOCKS: Block[] = [
  { name: 'JPL Building, west wing', x0: -55.5, x1: -42.5, z0: -62, z1: 23.3, floors: 4, wall: '#f6f1e6', rails: '#3f9a62', railsSide: 'w' },
  { name: 'JPL Building, link', x0: -42.5, x1: -33, z0: -6.7, z1: 8.3, floors: 3, wall: '#f6f1e6' },
  { name: 'JPL Building, hall', x0: -32.5, x1: -2, z0: -61, z1: 19, floors: 3, wall: '#f6f1e6', skylights: true },
  { name: 'JPL Building, south annex', x0: -34, x1: -5, z0: 19, z1: 23.5, floors: 1, wall: '#efe8da' },
  { name: 'College of Dentistry', x0: 9, x1: 75, z0: -67, z1: -44, floors: 3, wall: '#ffffff' },
  { name: 'Main academic building', x0: 16, x1: 41, z0: -26, z1: 60, floors: 5, wall: '#fde4c7' },
  { name: 'South building, west bar', x0: -3, x1: 32, z0: 75, z1: 84, floors: 4, wall: '#fdf1e0' },
  { name: 'South building, link', x0: 18, x1: 32, z0: 60, z1: 75, floors: 4, wall: '#fdf1e0' },
  { name: 'South building, north wing', x0: 32, x1: 55, z0: 59, z1: 87, floors: 5, wall: '#fdf1e0' },
  { name: 'South building, east wing', x0: 38, x1: 55, z0: 87, z1: 116, floors: 5, wall: '#fdf1e0' },
  { name: 'South building, south wing', x0: 33, x1: 56, z0: 116, z1: 137, floors: 5, wall: '#fdf1e0' },
  { name: 'Annex by the loop', x0: -56, x1: -43, z0: 49, z1: 56, floors: 1, wall: '#ffffff' },
];
// Covered walkways (the white ribbons in the imagery): centre polyline and width. Cars pass under them.
export const WALKWAYS: { pts: XZ[]; w: number }[] = [
  { pts: [[-58, -64.5], [-21, -64.5]], w: 5 },
  { pts: [[-19.5, 21], [-19.5, 63], [-9, 73], [-3, 77]], w: 4 },
  { pts: [[-1, 84], [-3.5, 96], [-7, 106], [-13, 111], [-44, 111]], w: 5 },
  { pts: [[-49.5, 56], [-45, 72], [-42, 87], [-44, 100], [-44, 111]], w: 4 },
];
export const WALKWAY_H = 3.2;
// Walkway posts every ~4 m along both edges, kept off the driveway and out of buildings.
export const WALKWAY_POSTS: XZ[] = [];
// (filled below, once the loop centreline exists)
// White-roofed pavilion inside the loop, and the rotonda island south of JPL (from the app's site notes).
export const PAVILION = { x: -31, z: 30.75, w: 15.75, d: 13.5 };
export const ROTONDA = { x: -7.5, z: 33, r: 4.5 };
// Main academic building entrance on the east leg: canopy, flags, yellow-kerbed lawn island (photo 6).
export const ENTRANCE = { x: 14.2, z: 35, w: 3.6, d: 7 };
export const ISLAND: Rect = [8.2, 12, 28.5, 41];

for (const { pts, w } of WALKWAYS)
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const L = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bx - ax, bz - az);
    const n = Math.max(1, Math.round(L / 4));
    for (let k = 0; k <= n; k++)
      for (const side of [-1, 1]) {
        const ox = side * (w / 2 - 0.3);
        const x = ax + ((bx - ax) * k) / n + Math.cos(ang) * ox;
        const z = az + ((bz - az) * k) / n - Math.sin(ang) * ox;
        if (nearestLoop(x, z).d < ROAD_W / 2 + 0.6 || BLOCKS.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) continue;
        WALKWAY_POSTS.push([x, z]);
      }
  }
// Pavilion posts: five along each long side.
export const PAVILION_POSTS: XZ[] = Array.from({ length: 10 }, (_, i) => [
  PAVILION.x - PAVILION.w / 2 + 0.6 + ((i % 5) * (PAVILION.w - 1.2)) / 4,
  PAVILION.z + (i < 5 ? -1 : 1) * (PAVILION.d / 2 - 0.6),
]);
// Carport posts down both long edges.
export const CARPORT_POSTS: XZ[] = [CARPORT[0] + 0.3, CARPORT[1] - 0.3].flatMap((x) => Array.from({ length: 7 }, (_, k): XZ => [x, CARPORT[2] + 0.3 + (k * (CARPORT[3] - CARPORT[2] - 0.6)) / 6]));

// ---------- placement helpers ----------
const segDist = (x: number, z: number, [ax, az]: XZ, [bx, bz]: XZ) => {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz || 1)));
  return Math.hypot(x - ax - vx * t, z - az - vz * t);
};
const BLOCK_RECTS: Rect[] = BLOCKS.map((b) => [b.x0, b.x1, b.z0, b.z1]);
const DRIVE_RECTS: Rect[] = DRIVES.map(([x, z, w, d]) => [x - w / 2, x + w / 2, z - d / 2, z + d / 2]);
const LOT_RECTS: Rect[] = Object.values(LOTS);
const HEDGE_PAD = 1.2;
/** True when a disc of radius r at (x, z) would sit on a building, road, lot, walkway, gate or island. */
export const occupied = (x: number, z: number, r: number) =>
  BLOCK_RECTS.some((b) => inRect(b, x, z, r)) ||
  LOT_RECTS.some((b) => inRect(b, x, z, r + HEDGE_PAD)) ||
  DRIVE_RECTS.some((b) => inRect(b, x, z, r + 1)) ||
  STREET_RECTS.some((b) => inRect(b, x, z, r)) ||
  nearestLoop(x, z).d < ROAD_W / 2 + SLOT_D + r ||
  WALKWAYS.some(({ pts, w }) => pts.some((p, i) => i > 0 && segDist(x, z, pts[i - 1], p) < w / 2 + r)) ||
  Math.hypot(x - FORECOURT.x, z - FORECOURT.z) < CANOPY.r + CANOPY.w / 2 + r ||
  inRect([PAVILION.x - PAVILION.w / 2, PAVILION.x + PAVILION.w / 2, PAVILION.z - PAVILION.d / 2, PAVILION.z + PAVILION.d / 2], x, z, r) ||
  Math.hypot(x - ROTONDA.x, z - ROTONDA.z) < ROTONDA.r + r ||
  inRect(ISLAND, x, z, r) ||
  GATE_LIST.some((g) => Math.hypot(x - g.x, z - g.z) < 7 + r);

// ---------- houses round the campus (OSM footprints, Kenney buildings) ----------
const KIT_HOUSES: CityModel[] = ['building-small-a', 'building-small-d', 'building-garage', 'building-small-b', 'building-small-a', 'building-small-c'];
const hash = (x: number, z: number) => Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
export type House = { model: CityModel; x: number; z: number; s: number; rot: number };
export const HOUSE_PROPS: House[] = [];
export const BIG_NEIGHBOURS: Block[] = [];
for (const [x, z, w, d, yaw, levels] of HOUSES) {
  if (Math.max(w, d) > 24) {
    const r: Rect = [x - w / 2, x + w / 2, z - d / 2, z + d / 2];
    if (BLOCK_RECTS.some((b) => b[0] < r[1] && b[1] > r[0] && b[2] < r[3] && b[3] > r[2]) || STREET_RECTS.some((b) => b[0] < r[1] && b[1] > r[0] && b[2] < r[3] && b[3] > r[2])) continue;
    BIG_NEIGHBOURS.push({ name: 'neighbour', x0: r[0], x1: r[1], z0: r[2], z1: r[3], floors: Math.max(2, Math.min(4, levels || 2)), wall: '#efe9df' });
    continue;
  }
  const s = Math.min(13, Math.max(7, Math.sqrt(w * d) * 1.05));
  if (occupied(x, z, s * 0.45)) continue;
  const h = hash(x, z);
  const model = levels >= 4 ? 'building-small-c' : levels === 3 ? 'building-small-b' : KIT_HOUSES[Math.floor(h * KIT_HOUSES.length)];
  HOUSE_PROPS.push({ model, x, z, s, rot: yaw + Math.floor(h * 4) * E });
}

// ---------- trees, lamps, the fountain ----------
// Kenney props: [model, x, z, scale (metres per tile), heading]
export type Prop = [CityModel, number, number, number, number];
const rng = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;
// groves filled on a jittered grid: [x0, x1, z0, z1, spacing, tree scale]
const GROVES: [number, number, number, number, number, number][] = [
  [-83, -72, -44, 116, 7.5, 9], // the rain-tree belt along the avenue and the west wall
  [-40.5, -35.5, -54, -9, 7, 7], // JPL courtyard, north of the link
  [-40.5, -35.5, 11, 16, 7, 7], // JPL courtyard, south of the link
  [-38, -24, 58, 107, 9, 10], // the south grove between the walkways
  [-14, 28, 88, 106, 9, 10], // south grove, east part
  [-34, 14, 52, 72, 8.5, 8.5], // between the loop base and the south building
  [22, 40, -43, -29, 7, 8], // between Dentistry, the main building and the east lot
  [-58, 50, 142, 156, 9, 9.5], // south edge
  [7, 30, 117, 140, 9, 10], // east of the south lot
  [-28, 70, -99, -87, 10, 9], // across Doña Aurelia
  [-114, -100, -170, 200, 12, 10], // across Tolentino
];
export const PROPS: Prop[] = [];
let ti = 0;
for (const [x0, x1, z0, z1, sp, sc] of GROVES) {
  for (let z = z0; z <= z1; z += sp)
    for (let x = x0; x <= x1; x += sp) {
      const jx = x + (rng(ti) - 0.5) * sp * 0.45;
      const jz = z + (rng(ti + 11) - 0.5) * sp * 0.45;
      ti++;
      if (occupied(jx, jz, sc * 0.3)) continue;
      PROPS.push([rng(ti) > 0.45 ? 'grass-trees-tall' : 'grass-trees', jx, jz, sc * (0.9 + rng(ti + 7) * 0.25), Math.floor(rng(ti + 3) * 4) * E]);
    }
}
PROPS.push(['pavement-fountain', ROTONDA.x, ROTONDA.z, 6, 0]);
// street lamps along the kerbs, clear of junctions
const nearAny = (a: number, list: number[]) => list.some((b) => Math.abs(a - b) < 11);
for (let z = -140; z <= 200; z += 24) if (!nearAny(z, [NORTH_ST, GATES.c.z])) PROPS.push(['road-straight-lightposts', WEST_ST, z, STREET_T, 0]);
for (let x = -64; x <= 72; x += 24) if (!nearAny(x, [LOOP_X.east])) PROPS.push(['road-straight-lightposts', x, NORTH_ST, STREET_T, E]);
for (let z = -52; z <= 200; z += 24) if (!nearAny(z, [GATES.b.z])) PROPS.push(['road-straight-lightposts', EAST_ST, z, STREET_T, 0]);

// Palms on the entrance island and along the east leg: [x, z, scale]
export const PALMS: [number, number, number][] = [
  [10.1, 30.5, 1], [10.1, 39, 1.1], [13.6, 44.5, 0.95], [10.8, -15.5, 1.05], [13.4, 27.6, 0.9],
];

// ---------- campus wall ----------
// The OSM campus edge, its north-west corner replaced by the gate canopy, opened at the north gate and Zone C's
// driveway; where a lot, building or the east street takes the edge, the hedge or building closes it instead.
export const WALL_SEGMENTS: [number, number, number, number][] = [];
{
  const chamfer = ([x, z]: XZ) => x < -58 && z < -50;
  const ring = CAMPUS_EDGE.slice(0, -1); // the last point repeats the first
  const n = ring.length;
  const start = ring.findIndex((p, i) => chamfer(ring[(i - 1 + n) % n]) && !chamfer(p));
  const path: XZ[] = [[CANOPY.x + CANOPY.r, CANOPY.z]];
  for (let k = 0; k < n; k++) {
    const p = ring[(start + k) % n];
    if (chamfer(p)) break;
    path.push(p);
  }
  path.push([CANOPY.x, CANOPY.z + CANOPY.r]);
  const open = (x: number, z: number) =>
    (Math.abs(x - GATES.north.x) < ROAD_W / 2 + 2 && z < -60) ||
    (Math.abs(z - GATES.c.z) < GAP && x < -60) ||
    x > EAST_ST - HALF_T ||
    LOT_RECTS.some((b) => inRect(b, x, z, HEDGE + 0.5)) ||
    BLOCK_RECTS.some((b) => inRect(b, x, z, -0.3));
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1];
    const [bx, bz] = path[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
    let from: XZ | null = null;
    let last: XZ = [ax, az];
    for (let k = 0; k <= steps; k++) {
      const x = ax + ((bx - ax) * k) / steps;
      const z = az + ((bz - az) * k) / steps;
      const shut = !open(x, z);
      if (shut) {
        from ??= [x, z];
        last = [x, z];
      }
      if ((!shut || k === steps) && from) {
        if (Math.hypot(last[0] - from[0], last[1] - from[1]) > 0.4) WALL_SEGMENTS.push([from[0], from[1], last[0], last[1]]);
        from = null;
      }
    }
  }
}

export const BOUNDS = { x0: -150, x1: 150, z0: -150, z1: 200 };

// ---------- the scroll tour route ----------
const slot = DEMO_SLOT;
export const PATHS = {
  // north on Tolentino Rd, right across the forecourt, wait under the canopy at the entry camera
  arrive: curve([
    v(WEST_ST + 1.7, 60), v(WEST_ST + 1.7, 0), v(WEST_ST + 1.7, -52), v(-85.2, -61.5), v(-80.5, -65.8), v(-74.5, -64.6), gateStop(G, 'out'),
  ]),
  // through the gate, down the tree avenue, nose-in to a free bay
  park: curve([gateStop(G, 'out'), v(G.x, G.z), v(-62, -49.5), v(LOOP_X.west, -40), v(LOOP_X.west + 0.6, slot.z - 7), v(LOOP_X.west - 1.2, slot.z - 2), v(slot.x, slot.z)]),
  // reverse out, tail swinging north so the nose ends up pointing down the avenue
  reverse: curve([v(slot.x, slot.z), v(LOOP_X.west - 2, slot.z - 1.2), v(LOOP_X.west + 0.5, slot.z - 5)]),
  // the rest of the loop: down the avenue, round the base, up the east leg to the exit camera
  loop: curve([
    v(LOOP_X.west + 0.5, slot.z - 5), v(LOOP_X.west, slot.z + 4),
    ...LOOP_PTS.slice(4, 14).map(([x, z]) => v(x, z)), // end of the avenue → base → east leg
    gateStop(GATES.north, 'in'),
  ]),
  // out of the north gate, left onto one-way Doña Aurelia St
  out: curve([gateStop(GATES.north, 'in'), v(LOOP_X.east, -68), v(LOOP_X.east - 1, -73), v(LOOP_X.east - 4.5, NORTH_ST - 0.6), v(LOOP_X.east - 12, NORTH_ST - 0.8), v(LOOP_X.east - 74, NORTH_ST - 0.8)]),
};
