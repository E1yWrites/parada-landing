// Painted signboard textures (canvas), in the site's route-board style: enamel ground,
// chrome frame, yellow pinstripe, cream sign-painter lettering with a red drop shade.
import * as THREE from 'three';

type SignOpts = { w?: number; h?: number; bg?: string; fg?: string; shade?: string; size?: number };

const family = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
  return v || 'Impact, sans-serif';
};

export function signTexture(lines: string[], { w = 512, h = 256, bg = '#1b3fb8', fg = '#fff3d1', shade = '#d22b2b', size = 92 }: SignOpts = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const draw = () => {
    const g = c.getContext('2d')!;
    g.fillStyle = '#c9cfd6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = bg;
    g.fillRect(10, 10, w - 20, h - 20);
    g.strokeStyle = '#f6c31c';
    g.lineWidth = 4;
    g.strokeRect(24, 24, w - 48, h - 48);
    const f = family();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const n = lines.length;
    lines.forEach((line, i) => {
      const s = i === 0 ? size : size * 0.5;
      g.font = `400 ${s}px ${f}`;
      const y = n === 1 ? h / 2 + 4 : h * (i === 0 ? 0.42 : 0.74);
      g.fillStyle = shade;
      g.fillText(line, w / 2 + s * 0.05, y + s * 0.05);
      g.fillStyle = fg;
      g.fillText(line, w / 2, y);
    });
    t.needsUpdate = true;
  };
  draw();
  document.fonts?.load(`400 64px ${family()}`).then(draw, () => {});
  return t;
}

export function plateTexture(text: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f7f7f2';
  g.fillRect(0, 0, 512, 160);
  g.strokeStyle = '#15171b';
  g.lineWidth = 8;
  g.strokeRect(6, 6, 500, 148);
  g.fillStyle = '#15171b';
  g.font = '700 96px ui-monospace, "JetBrains Mono", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 88);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
