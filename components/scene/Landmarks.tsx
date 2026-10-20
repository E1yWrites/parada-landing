// The official campus map's legend over the model, on the Background slide: each numbered building gets a tag at
// its roof, named as the map names it. Numbers and names come from the block names in layout.ts ("Name [n]").
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BLOCKS, CHAPEL, GATES, FLOOR_H } from './layout';
import { near } from './state';

type Mark = { n: number; name: string; at: [number, number, number] };

// tags moved off their building's centre where two would overlap: JPL's off Zone A's tag, Power House's off the chapel's
const NUDGE: Record<number, [number, number]> = { 2: [-48, -44], 10: [-58, 30] };

const MARKS: Mark[] = (() => {
  const seen = new Map<number, Mark & { area: number }>();
  for (const b of BLOCKS) {
    const m = /^([^,[]+?)(?:,[^[]*)?\s*\[(\d+)\]$/.exec(b.name);
    if (!m) continue;
    const xs = b.pts.map((p) => p[0]);
    const zs = b.pts.map((p) => p[1]);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...zs) - Math.min(...zs));
    if ((seen.get(+m[2])?.area ?? 0) >= area) continue; // the tag sits on the number's largest block
    const [x, z] = NUDGE[+m[2]] ?? [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
    seen.set(+m[2], { n: +m[2], name: m[1].trim(), at: [x, b.floors * FLOOR_H + 3, z], area });
  }
  seen.set(1, { n: 1, name: 'Main Entrance Gate', at: [GATES.main.x, 8, GATES.main.z], area: 0 });
  seen.set(9, { n: 9, name: 'Chapel', at: [CHAPEL.x + 6, 9, CHAPEL.z], area: 0 });
  return [...seen.values()].sort((a, b) => a.n - b.n);
})();

const v = new THREE.Vector3();

export default function Landmarks() {
  const group = useRef<HTMLDivElement[]>([]);
  const last = useRef(-1);
  const at = useMemo(() => MARKS.map((m) => new THREE.Vector3(...m.at)), []);
  useFrame((state) => {
    const k = near('background', 0.8);
    if (k === 0 && last.current === 0) return;
    last.current = k;
    group.current.forEach((el, i) => {
      // an Html label is projected even when its point is behind the camera; only show it in front
      const front = v.copy(at[i]).applyMatrix4(state.camera.matrixWorldInverse).z < 0;
      el.style.opacity = String(front ? k : 0);
      el.style.visibility = front && k > 0.01 ? 'visible' : 'hidden';
    });
  });
  return (
    <>
      {MARKS.map((m, i) => (
        <Html key={m.n} position={m.at} center zIndexRange={[1, 0]}>
          <div ref={(el) => void (el && (group.current[i] = el))} className="mark3d" style={{ visibility: 'hidden', opacity: 0 }}>
            <b className="num">{m.n}</b>
            {m.name}
          </div>
        </Html>
      ))}
    </>
  );
}
