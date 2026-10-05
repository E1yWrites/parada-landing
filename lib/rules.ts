// PARADA's admission rule at a zone's entry camera, as the backend decides it
// (E1yWrites/parada, services/api/src/domain/occupancy.ts › decideGuestAdmission). Pure, no imports.

export type Plate = 'registered' | 'guest';
// PRIMARY_ZONE: guests only in the primary guest zone. DENY_WHEN_FULL: guests in any zone with space.
export type Policy = 'primary' | 'space';
export const GUEST_ZONE = 2; // Zone C is the primary guest zone in this demo

/** A registered plate is admitted unless the zone is full; a guest candidate must also pass the guest policy. */
export function admit(plate: Plate, policy: Policy, zone: number, occupied: number, capacity: number): { ok: true } | { ok: false; reason: 'full' | 'not-guest-zone' } {
  if (plate === 'guest' && policy === 'primary' && zone !== GUEST_ZONE) return { ok: false, reason: 'not-guest-zone' };
  if (occupied >= capacity) return { ok: false, reason: 'full' };
  return { ok: true };
}
