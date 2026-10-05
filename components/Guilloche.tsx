'use client';
// Security-print linework for every pass, receipt and form, generated from the plate on the pass: interleaved
// sine bands whose wavelength, swing and phase come from the plate's characters, so ABC 1234 and the guest plate
// each print their own pattern. Written to --guilloche-bg; the cards fall back to plain mint without it.
import { useEffect } from 'react';
import { plateText, useGame } from '@/lib/game';

const W = 260;
const H = 130;

export function guilloche(seedText: string) {
  let h = 2166136261;
  for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const r = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
  const k = 2 + Math.floor(r() * 3); // whole waves per tile keeps it seamless left to right
  const amp = 7 + r() * 8;
  const step = 6 + Math.floor(r() * 3);
  const drift = 0.35 + r() * 0.6;
  const paths: string[] = [];
  for (let band = -2; band * step < H + step * 2; band++) {
    for (const [phase, op] of [[0, 0.34], [Math.PI, 0.2]] as const) {
      let d = '';
      for (let x = 0; x <= W; x += 5) {
        const y = band * step + amp * Math.sin((x / W) * Math.PI * 2 * k + band * drift + phase);
        d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
      }
      paths.push(`<path d='${d}' stroke-opacity='${op}'/>`);
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><g fill='none' stroke='%232f7a5b' stroke-width='0.7'>${paths.join('')}</g></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/"/g, "'")}")`;
}

export default function Guilloche() {
  const { plate } = useGame();
  useEffect(() => {
    document.documentElement.style.setProperty('--guilloche-bg', guilloche(plateText(plate)));
  }, [plate]);
  return null;
}
