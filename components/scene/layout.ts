// LPU-Batangas main campus, modelled from OpenStreetMap (campusData.ts: campus edge, neighbouring buildings)
// and satellite imagery (campus buildings, covered walkways, the loop driveway). Scene frame: metres from the
// campus pin (13.7637974 N, 121.0652952 E), +x east, +z south, rotated 10° so the campus buildings sit on
// the grid.
//
// PARADA logic, as in the app (E1yWrites/parada) and the landing's demo data: every zone is enclosed and its
// count changes only at its gate cameras; bays are layout only. Zone A is the Main Loop round the JPL
// Building: entry camera at the main gate (the curved canopy on the north-west corner, photo 1), exit camera
// at the north gate on Doña Aurelia St (photo 8). Only Zone A is modelled; Zones B and C live in the page and HUD
// as numbers.
import * as THREE from 'three';
import { ZONES } from '@/lib/content';
import { CAMPUS_EDGE, HOUSES } from './campusData';

export const SLOT_W = 2.7;
export const SLOT_D = 5.2;
export const ROAD_W = 7; // campus driveway
export const STREET_T = 10; // street corridor width, metres
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

// ---------- public streets ----------
export const WEST_ST = -88; // Tolentino Rd → P. Herrera St
export const NORTH_ST = -76; // Doña Aurelia St (one-way, westbound)
export const EAST_ST = 84; // Gamboa Rd
const HALF_T = STREET_T / 2;

// ---------- gates ----------
// The main gate canopy is a quarter ring round the north-west corner forecourt; cars pass under its middle.
export const CANOPY = { x: -76.7, z: -68.3, r: 17.5, w: 5, opening: 4.6 / 17.5 }; // opening: half-angle kept clear for the road
const MID = Math.PI / 4;
export const LOOP_X = { west: -61, east: 3.5 };

export type GateId = 'main' | 'north';
export type Gate = {
  id: GateId;
  zone: number; // index into ZONES
  kind: 'entry' | 'exit' | 'both';
  x: number;
  z: number;
  inward: number; // heading of a car driving INTO the zone through this gate
  style: 'canopy' | 'pergola';
  cam: string; // camera identifier, as in the landing's admin data
};
export const GATES: Record<GateId, Gate> = {
  main: { id: 'main', zone: 0, kind: 'entry', x: CANOPY.x + CANOPY.r * Math.sin(MID), z: CANOPY.z + CANOPY.r * Math.cos(MID), inward: MID, style: 'canopy', cam: 'cam-a-entry' },
  north: { id: 'north', zone: 0, kind: 'exit', x: LOOP_X.east, z: -64.5, inward: S, style: 'pergola', cam: 'cam-a-exit' },
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

const segDist = (x: number, z: number, [ax, az]: XZ, [bx, bz]: XZ) => {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz || 1)));
  return Math.hypot(x - ax - vx * t, z - az - vz * t);
};

// ---------- Zone A's bays (layout only; capacity is the authority) ----------
export type Slot = { x: number; z: number; rot: number };
// Rows along z start at z0 (edge) and sit at x0 (centre).
type Row = { x0: number; z0: number; dx: number; dz: number; count: number; rot: number };
const offA = ROAD_W / 2 + SLOT_D / 2;
// nose-in bays under the avenue trees (photos 2–4) and along the east leg (photo 6)
const ROWS_A: Row[] = [
  { x0: LOOP_X.west - offA, z0: -34, dx: 0, dz: SLOT_W, count: 18, rot: W },
  { x0: LOOP_X.east + offA, z0: -12, dx: 0, dz: SLOT_W, count: 14, rot: E },
];
const ZA = ZONES[0];
export const ZONE_A = {
  ...ZA,
  rows: ROWS_A,
  slots: ROWS_A.flatMap((r) => Array.from({ length: r.count }, (_, i): Slot => ({ x: r.x0 + r.dx * (i + 0.5), z: r.z0 + r.dz * (i + 0.5), rot: r.rot }))),
  tag: new THREE.Vector3(-50, 0, -16), // floats over the avenue's JPL side
};

// Deterministic "which bays are taken", in proportion to the zone's count so the avenue reads like the number.
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
export const TAKEN = new Set(takenSlots(ZONE_A.slots.length, Math.round((ZONE_A.slots.length * ZA.occupied) / ZA.capacity), 11));

// The tour car takes a free avenue bay part-way down the west leg (any free bay would do).
export const DEMO_SLOT = ZONE_A.slots[ZONE_A.slots.findIndex((s, i) => s.rot === W && s.z > -24 && !TAKEN.has(i))];

// Street corridors [centerX, centerZ, sizeX, sizeZ], for driving and placement tests
export const STREETS: [number, number, number, number][] = [
  [WEST_ST, 25, STREET_T, 422],
  [(WEST_ST + EAST_ST) / 2, NORTH_ST, EAST_ST - WEST_ST + STREET_T, STREET_T],
  [EAST_ST, 80, STREET_T, 322],
];
const STREET_RECTS: Rect[] = STREETS.map(([x, z, w, d]) => [x - w / 2, x + w / 2, z - d / 2, z + d / 2]);

// ---------- buildings: footprints traced off satellite imagery (tracing board kept locally in research/) ----------
export type Block = {
  name: string;
  pts: XZ[]; // footprint, any winding
  floors: number;
  wall: string;
  roof: 'flat' | 'hip' | 'skylights';
  roofColor?: string;
  rails?: { a: XZ; b: XZ; out: XZ; color: string }; // balcony slabs + rails along one facade run
  sign?: string; // name board over the facade facing Doña Aurelia St
};
const rect = (x0: number, z0: number, x1: number, z1: number): XZ[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
export const BLOCKS: Block[] = [
  { name: 'JPL Building, west wing', pts: [[-53.3, -61.5], [-42.6, -61.5], [-42.6, -6.7], [-34.2, -6.7], [-34.2, 23.3], [-55, 23.3], [-55, 12], [-53.3, 12]], floors: 4, wall: '#f3eee2', roof: 'flat', rails: { a: [-53.3, -60], b: [-53.3, 10], out: [-1, 0], color: '#3f8a5c' }, sign: 'JPL BUILDING' },
  { name: 'JPL Building, hall', pts: rect(-32.7, -60.3, -1.8, 16.7), floors: 3, wall: '#f3eee2', roof: 'skylights', roofColor: '#e9ebec' },
  { name: 'JPL Building, south annex', pts: rect(-34.2, 16.7, 0, 23.3), floors: 1, wall: '#ece5d6', roof: 'flat' },
  { name: 'College of Dentistry', pts: [[8.3, -66.7], [74.2, -66.7], [74.2, -43.3], [33, -43.3], [33, -47.5], [8.3, -47.5]], floors: 3, wall: '#f7f5f0', roof: 'flat', sign: 'COLLEGE OF DENTISTRY' },
  { name: 'North-east building', pts: [[44.5, -36.7], [50, -36.7], [50, -32.2], [60, -32.2], [60, -11.1], [50, -11.1], [50, -23.3], [44.5, -30]], floors: 2, wall: '#f1ede4', roof: 'flat' },
  { name: 'Red-roof block', pts: rect(61, -42, 75.5, -25.5), floors: 2, wall: '#efe6d4', roof: 'hip', roofColor: '#a9483a' },
  { name: 'Library', pts: rect(15.8, -22.5, 40, 60), floors: 5, wall: '#e9e1d2', roof: 'hip', roofColor: '#7c8188' },
  { name: 'Library link', pts: rect(16.7, 64, 30.8, 86.7), floors: 3, wall: '#f1ebdf', roof: 'flat' },
  { name: 'South building', pts: [[30.8, 58.3], [45, 58.3], [45, 72.5], [55, 72.5], [55, 136.7], [32.5, 136.7], [32.5, 125], [40, 113], [40, 86.7], [30.8, 86.7]], floors: 5, wall: '#f4ecdd', roof: 'flat' },
  { name: 'Courtyard, west arm', pts: rect(-48.5, 66, -42.5, 105), floors: 2, wall: '#f4efe6', roof: 'flat' },
  { name: 'Courtyard, south arm', pts: rect(-48.5, 105, 3.3, 113.3), floors: 2, wall: '#f4efe6', roof: 'flat' },
  { name: 'Courtyard, east arm', pts: [[-5.5, 105], [10, 81], [16.7, 77], [16.7, 87.5], [13.5, 88.5], [3.3, 105]], floors: 2, wall: '#f4efe6', roof: 'flat' },
  { name: 'Annex by the loop', pts: rect(-57.5, 49, -43, 56), floors: 1, wall: '#f7f5f0', roof: 'flat' },
];
/** Even-odd point-in-polygon. */
export const inPoly = (pts: XZ[], x: number, z: number) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i];
    const [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
const polyEdgeDist = (pts: XZ[], x: number, z: number) => Math.min(...pts.map((p, i) => segDist(x, z, pts[(i + pts.length - 1) % pts.length], p)));
/** Inside the polygon or within `pad` of it (negative pad: at least -pad inside). */
const polyHit = (pts: XZ[], x: number, z: number, pad: number) => {
  const ins = inPoly(pts, x, z);
  if (pad >= 0) return ins || polyEdgeDist(pts, x, z) < pad;
  return ins && polyEdgeDist(pts, x, z) > -pad;
};
export const inBlock = (x: number, z: number, pad = 0) => BLOCKS.some((b) => polyHit(b.pts, x, z, pad));

// Covered walkways (the white ribbons in the imagery): centre polyline and width. Cars pass under them.
export const WALKWAYS: { pts: XZ[]; w: number }[] = [
  { pts: [[-58, -66.3], [-45.5, -66.3]], w: 3.9 },
  { pts: [[-41, -65], [-29, -65]], w: 4 },
  { pts: [[-19.5, 23.3], [-19.5, 63], [-9, 73], [-3, 77]], w: 4 },
  { pts: [[-49.5, 56], [-46.5, 66]], w: 4 },
];
export const WALKWAY_H = 3.2;
// White-roofed pavilion inside the loop, and the rotonda island south of JPL (from the app's site notes).
export const PAVILION = { x: -31, z: 30.75, w: 15.75, d: 13.5 };
export const ROTONDA = { x: -7.5, z: 33, r: 4.5 };
// Library entrance on the east leg: canopy, flags, yellow-kerbed lawn island (photo 6).
export const ENTRANCE = { x: 14.2, z: 35, w: 3.6, d: 7 };
export const ISLAND: Rect = [8.2, 12, 28.5, 41];

// Walkway posts every ~4 m along both edges, kept off the driveway and out of buildings.
export const WALKWAY_POSTS: XZ[] = [];
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
        if (nearestLoop(x, z).d < ROAD_W / 2 + 0.6 || inBlock(x, z, 0.2)) continue;
        WALKWAY_POSTS.push([x, z]);
      }
  }
// Pavilion posts: five along each long side.
export const PAVILION_POSTS: XZ[] = Array.from({ length: 10 }, (_, i) => [
  PAVILION.x - PAVILION.w / 2 + 0.6 + ((i % 5) * (PAVILION.w - 1.2)) / 4,
  PAVILION.z + (i < 5 ? -1 : 1) * (PAVILION.d / 2 - 0.6),
]);

// ---------- placement helpers ----------
const inRectPad = (r: Rect, x: number, z: number, pad: number) => inRect(r, x, z, pad);
/** True when a disc of radius r at (x, z) would sit on a building, road, walkway, gate or island. */
export const occupied = (x: number, z: number, r: number) =>
  inBlock(x, z, r) ||
  STREET_RECTS.some((b) => inRectPad(b, x, z, r + 1.5)) ||
  nearestLoop(x, z).d < ROAD_W / 2 + SLOT_D + r ||
  WALKWAYS.some(({ pts, w }) => pts.some((p, i) => i > 0 && segDist(x, z, pts[i - 1], p) < w / 2 + r)) ||
  Math.hypot(x - FORECOURT.x, z - FORECOURT.z) < CANOPY.r + CANOPY.w / 2 + r ||
  inRect([PAVILION.x - PAVILION.w / 2, PAVILION.x + PAVILION.w / 2, PAVILION.z - PAVILION.d / 2, PAVILION.z + PAVILION.d / 2], x, z, r) ||
  Math.hypot(x - ROTONDA.x, z - ROTONDA.z) < ROTONDA.r + r ||
  inRect(ISLAND, x, z, r) ||
  GATE_LIST.some((g) => Math.hypot(x - g.x, z - g.z) < 7 + r);

// ---------- houses round the campus (OpenStreetMap footprints) ----------
// Plastered walls under hipped corrugated roofs, the way the neighbourhood reads from above.
const hash = (x: number, z: number) => Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
const WALLS = ['#efe7d8', '#f3eee4', '#e9dcc4', '#dfe5e3', '#efe2d6', '#e6e1d3'];
const ROOFS = ['#a4473a', '#b5553f', '#8e3f36', '#5f7d97', '#7a7f86', '#9b5a3c', '#a4473a', '#6f8c7a'];
export type House = { x: number; z: number; w: number; d: number; h: number; yaw: number; wall: string; roof: string };
export const HOUSE_LIST: House[] = [];
for (const [x, z, w0, d0, yaw, levels] of HOUSES) {
  const w = Math.min(26, Math.max(4.5, w0));
  const d = Math.min(26, Math.max(4.5, d0));
  if (inBlock(x, z, Math.min(w, d) / 2) || STREET_RECTS.some((b) => inRect(b, x, z, Math.min(w, d) / 2 + 1)) || occupied(x, z, Math.min(w, d) * 0.35)) continue;
  const k = hash(x, z);
  HOUSE_LIST.push({ x, z, w, d, h: Math.max(1, Math.min(4, levels || (k > 0.6 ? 2 : 1))) * 3, yaw, wall: WALLS[Math.floor(k * WALLS.length)], roof: ROOFS[Math.floor(hash(z, x) * ROOFS.length)] });
}

// ---------- trees ----------
// [x, z, canopy diameter (m), kind]; kind 1 is the flame tree in the south courtyard
export type Tree = [number, number, number, number];
const rng = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;
// groves filled on a jittered grid: [x0, x1, z0, z1, spacing, canopy]
const GROVES: [number, number, number, number, number, number][] = [
  [-82, -71, -44, 116, 8, 11], // the rain-tree belt along the avenue and the west wall
  [-40.5, -35.5, -54, -9, 7, 7], // JPL courtyard, north of the link
  [-50, 30, 58, 103, 9, 12], // the courtyard groves between the arms
  [-14, 28, 114, 146, 9, 12], // south of the courtyard
  [-34, 14, 50, 60, 8, 9], // between the loop base and the courtyard
  [12, 44, -42, -27, 7, 9], // between Dentistry and the library
  [-58, 75, 140, 160, 9, 11], // south edge
  [-28, 70, -99, -86, 10, 10], // across Doña Aurelia
  [-118, -98, -170, 200, 12, 11], // across Tolentino
  [57, 76, 0, 60, 9, 9], // the east yard
];
export const TREES: Tree[] = [[-12, 128, 18, 1]];
let ti = 0;
for (const [x0, x1, z0, z1, sp, sc] of GROVES) {
  for (let z = z0; z <= z1; z += sp)
    for (let x = x0; x <= x1; x += sp) {
      const jx = x + (rng(ti) - 0.5) * sp * 0.5;
      const jz = z + (rng(ti + 11) - 0.5) * sp * 0.5;
      ti++;
      const s = sc * (0.75 + rng(ti + 7) * 0.5);
      if (occupied(jx, jz, s * 0.3) || HOUSE_LIST.some((h) => Math.hypot(h.x - jx, h.z - jz) < Math.max(h.w, h.d) / 2 + 1) || TREES.some(([tx, tz, ts]) => Math.hypot(tx - jx, tz - jz) < (ts + s) * 0.32)) continue;
      TREES.push([jx, jz, s, 0]);
    }
}
// Palms on the entrance island and along the east leg: [x, z, scale]
export const PALMS: [number, number, number][] = [
  [10.1, 30.5, 1], [10.1, 39, 1.1], [13.6, 44.5, 0.95], [10.8, -15.5, 1.05], [13.4, 27.6, 0.9],
];
// Concrete electric poles along the streets, wired pole to pole: runs of [x, z]
export const POLE_RUNS: XZ[][] = [
  Array.from({ length: 13 }, (_, i): XZ => [WEST_ST - STREET_T / 2 - 0.8, -150 + i * 30]).filter(([, z]) => Math.abs(z - NORTH_ST) > 8),
  Array.from({ length: 6 }, (_, i): XZ => [-52 + i * 26, NORTH_ST - STREET_T / 2 - 0.8]),
];

// ---------- campus wall ----------
// The OSM campus edge, its north-west corner replaced by the gate canopy, opened at the north gate; buildings
// on the edge close it themselves.
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
  const open = (x: number, z: number) => (Math.abs(x - GATES.north.x) < ROAD_W / 2 + 2 && z < -60) || x > EAST_ST - HALF_T || inBlock(x, z, -0.3);
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
