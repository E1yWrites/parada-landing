'use client';
// Zone tally strip. Server-renders the content.ts figures; drive mode updates them live.
import { ZONES, band } from '@/lib/content';
import { useGame } from '@/lib/game';

export default function Tally() {
  const { counts } = useGame();
  return (
    <ul className="tally" aria-label="Zone occupancy (demo figures)">
      {ZONES.map((z, i) => {
        const occupied = counts[i];
        return (
          <li key={z.code} data-band={band({ ...z, occupied })}>
            <b>{z.code}</b>
            <span className="num">
              {occupied}/{z.capacity}
            </span>
            <span className="sr-only"> occupied in {z.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
