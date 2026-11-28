'use client';
// The problem, as a switch: the same busy morning as the office sees it today (nothing until someone counts) and with
// PARADA (every area's count from its gate cameras). Without script it shows the PARADA view.
import { useEffect, useState } from 'react';
import { ZONES, band } from '@/lib/content';

export default function Morning() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(false), []); // with script, start on today and let the visitor flip it
  return (
    <figure className="board morning" data-view={on ? 'parada' : 'today'}>
      <figcaption>
        <b>A busy morning</b>
        <span>What your office sees</span>
      </figcaption>
      <fieldset className="switch">
        <legend className="sr-only">View</legend>
        <label>
          <input type="radio" name="morning" checked={!on} onChange={() => setOn(false)} />
          <span>Today</span>
        </label>
        <label>
          <input type="radio" name="morning" checked={on} onChange={() => setOn(true)} />
          <span>With PARADA</span>
        </label>
      </fieldset>
      <ul className="zones" aria-label={on ? 'Free spaces per parking area (demo figures)' : 'Free spaces per parking area: unknown today'} aria-live="polite">
        {ZONES.map((z, i) => (
          <li key={z.code} data-band={on ? band(z) : 'unknown'} style={{ '--pct': z.occupied / z.capacity, '--i': i } as React.CSSProperties}>
            <b>
              {z.name} · {z.area}
            </b>
            <span className="num">{on ? `${z.occupied}/${z.capacity}` : `?/${z.capacity}`}</span>
            <span className="meter" aria-hidden="true">
              <i />
            </span>
            <small>{on ? `${z.capacity - z.occupied} free` : 'not counted'}</small>
          </li>
        ))}
      </ul>
      <p className="fine">
        {on
          ? 'Demo figures. Zone B is nearly full, and drivers see that before they drive to it.'
          : 'Today the count is a guess from the gate, if anyone is counting at all. Flip the switch.'}
      </p>
    </figure>
  );
}
