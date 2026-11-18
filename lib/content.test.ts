// Guards the numbers the site repeats in several places. Run: npm run check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, totals, band, PIPELINE, ARCHITECTURE, PROBLEM, OBJECTIVES, ROADMAP, parkingFee } from './content.ts';

test('zone facts match the live site', () => {
  assert.deepEqual(ZONES.map((z) => `${z.occupied}/${z.capacity}`), ['18/30', '42/50', '15/40']);
  assert.deepEqual(totals(ZONES), { capacity: 120, occupied: 75, available: 45 });
});

test('demo arrival ticks Zone A 18 → 19/30', () => {
  const after = ZONES.map((z) => (z.code === 'A' ? { ...z, occupied: z.occupied + 1 } : z));
  assert.equal(after[0].occupied, 19);
  assert.deepEqual(totals(after), { capacity: 120, occupied: 76, available: 44 });
});

test('occupancy bands', () => {
  assert.deepEqual(ZONES.map(band), ['busy', 'full', 'free']);
});

test('pipeline and architecture shape', () => {
  assert.equal(PIPELINE.length, 9);
  assert.equal(ARCHITECTURE.length, 9);
});

test('every stated problem points at a real objective', () => {
  for (const p of PROBLEM.specific) assert.ok(p.answer >= 1 && p.answer <= OBJECTIVES.specific.length, p.text);
});

test('roadmap: phases in order, all done (final paper, Nov 2026)', () => {
  assert.deepEqual(ROADMAP.map(([n]) => Number(n)), ROADMAP.map((_, i) => i));
  assert.ok(ROADMAP.every(([, , done]) => done));
});

test('paper objectives: five specific', () => assert.equal(OBJECTIVES.specific.length, 5));

test('fee: ₱20 for the first two hours, ₱10 per started hour after', () => {
  assert.deepEqual([0, 120, 121, 180, 181].map(parkingFee), [20, 20, 30, 30, 40]);
});
