// Guards the numbers the site repeats in several places. Run: npm run check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, totals, band, PIPELINE, ARCHITECTURE } from './content.ts';

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
