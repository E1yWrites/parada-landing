'use client';
// Callouts pinned to the campus still in the hero: tap or hover a pin to read what that spot does. One open at a time;
// Escape or a tap elsewhere closes it. Positions are fractions of the image, set per image in CSS (--x, --y).
import { useEffect, useRef, useState } from 'react';

const PINS = [
  { id: 'entry', title: 'Entry camera', body: 'Reads each plate as a car drives in. Zone A’s count goes up right here.' },
  { id: 'zone', title: 'Zone A: 18 of 30', body: 'The count lives at the gates. Drivers see it in the app before they turn in.' },
  { id: 'bays', title: 'No sensor in any bay', body: 'Just paint. Nothing to install, wire or replace for each space.' },
];

export default function HeroPins() {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    addEventListener('pointerdown', away);
    addEventListener('keydown', esc);
    return () => {
      removeEventListener('pointerdown', away);
      removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className="pins" ref={ref}>
      {PINS.map((p) => (
        <div key={p.id} className={`pin ${p.id}`} data-open={open === p.id || undefined}>
          <button type="button" aria-expanded={open === p.id} aria-controls={`pin-${p.id}`} onClick={() => setOpen((o) => (o === p.id ? null : p.id))}>
            <span className="sr-only">{p.title}</span>
          </button>
          <div id={`pin-${p.id}`} className="pin-tag" role="note">
            <b>{p.title}</b>
            {p.body}
          </div>
        </div>
      ))}
    </div>
  );
}
