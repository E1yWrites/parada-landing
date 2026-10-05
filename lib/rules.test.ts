import { test } from 'node:test';
import assert from 'node:assert/strict';
import { admit, GUEST_ZONE } from './rules.ts';
import { ZONES } from './content.ts';

const at = (plate: 'registered' | 'guest', policy: 'primary' | 'space', z: number, full = false) => admit(plate, policy, z, full ? ZONES[z].capacity : ZONES[z].occupied, ZONES[z].capacity);

test('registered plates are admitted at any zone with space', () => {
  for (let z = 0; z < ZONES.length; z++) assert.deepEqual(at('registered', 'primary', z), { ok: true });
});

test('a full zone turns everyone away, registered or guest', () => {
  assert.deepEqual(at('registered', 'primary', 0, true), { ok: false, reason: 'full' });
  assert.deepEqual(at('guest', 'space', 1, true), { ok: false, reason: 'full' });
  assert.deepEqual(at('guest', 'primary', GUEST_ZONE, true), { ok: false, reason: 'full' });
});

test('primary-zone policy admits guests only in the guest zone', () => {
  assert.deepEqual(at('guest', 'primary', GUEST_ZONE), { ok: true });
  for (let z = 0; z < ZONES.length; z++) if (z !== GUEST_ZONE) assert.deepEqual(at('guest', 'primary', z), { ok: false, reason: 'not-guest-zone' });
});

test('any-zone-with-space policy admits guests wherever there is room', () => {
  for (let z = 0; z < ZONES.length; z++) assert.deepEqual(at('guest', 'space', z), { ok: true });
});
