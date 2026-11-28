// Guards the numbers the site repeats in several places. Run: npm run check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, totals, band, PIPELINE, ARCHITECTURE, STOPS, PROOF, parkingFee } from './content.ts';

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

test('landing: three stops, three results', () => {
  assert.equal(STOPS.length, 3);
  assert.deepEqual(PROOF.map((p) => p.value), ['87.1%', '10 / 10', '0.39 s']);
});

test('fee: ₱20 for the first two hours, ₱10 per started hour after', () => {
  assert.deepEqual([0, 120, 121, 180, 181].map(parkingFee), [20, 20, 30, 30, 40]);
});
