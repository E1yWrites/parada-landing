// Guards the numbers the site repeats in several places. Run: npm run check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, totals, band, PIPELINE, ARCHITECTURE, PROBLEM, OBJECTIVES, ROADMAP, parkingFee, ACCURACY, TESTS, CONCLUSIONS, RECOMMENDATIONS, ERD, PROCESSES, AGILE } from './content.ts';

test('demo zones stay inside the paper scope (about 50 to 100 spaces)', () => {
  assert.deepEqual(ZONES.map((z) => `${z.occupied}/${z.capacity}`), ['18/30', '34/40', '12/30']);
  assert.deepEqual(totals(ZONES), { capacity: 100, occupied: 64, available: 36 });
});

test('demo arrival ticks Zone A 18 → 19/30', () => {
  const after = ZONES.map((z) => (z.code === 'A' ? { ...z, occupied: z.occupied + 1 } : z));
  assert.equal(after[0].occupied, 19);
  assert.deepEqual(totals(after), { capacity: 100, occupied: 65, available: 35 });
});

test('occupancy bands', () => {
  assert.deepEqual(ZONES.map(band), ['busy', 'full', 'free']);
  // Zone B is under the 20% low-availability threshold, as the demo alert says
  assert.ok((ZONES[1].capacity - ZONES[1].occupied) / ZONES[1].capacity <= 0.2);
});

test('pipeline and architecture shape', () => {
  assert.equal(PIPELINE.length, 9);
  assert.equal(ARCHITECTURE.length, 6); // Figure 7: cameras, vision, API, database, two apps
});

test('every stated problem points at a real objective', () => {
  for (const p of PROBLEM.specific) assert.ok(p.answer >= 1 && p.answer <= OBJECTIVES.specific.length, p.text);
});

test('roadmap: phases numbered in order from 1', () => assert.deepEqual(ROADMAP.map(([n]) => Number(n)), ROADMAP.map((_, i) => i + 1)));

test('paper objectives: five specific', () => assert.equal(OBJECTIVES.specific.length, 5));

test('fee: ₱20 for the first two hours, ₱10 per started hour after', () => {
  assert.deepEqual([0, 120, 121, 180, 181].map(parkingFee), [20, 20, 30, 30, 40]);
});

test('paper tables add up', () => {
  // Table 2: images per condition sum to 1,150
  assert.equal(ACCURACY.rows.reduce((n, [, i]) => n + Number(i), 0), 1150);
  // Table 1: tests per workspace sum to 1,239, 2 skipped
  assert.equal(TESTS.reduce((n, [, , p]) => n + Number(p), 0), 1239);
  assert.equal(TESTS.reduce((n, [, , , k]) => n + Number(k), 0), 2);
});

test('paper structure: one conclusion per objective, nine recommendations, 18 entities, 7 processes', () => {
  assert.deepEqual(CONCLUSIONS.map((c) => Number(c.obj)), OBJECTIVES.specific.map((_, i) => i + 1));
  assert.equal(RECOMMENDATIONS.length, 9);
  assert.equal(ERD.entities.length, 18);
  assert.equal(PROCESSES.length, 7);
});

test('agile: six phases, seventeen increments; the audit is the paper\'s Phase 10.1', () => {
  assert.equal(AGILE.length, 6);
  assert.equal(ROADMAP.length, 17);
  assert.equal(ROADMAP[9][1], 'Admin overhaul + system-wide audit');
});
