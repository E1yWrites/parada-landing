// Synthesised UI sounds (Web Audio, no files). Off by default; the header toggle turns it on.
// Browsers only allow audio after a user gesture, so the context is created on first enable.

export type Sfx = 'scan' | 'ocr' | 'whoosh' | 'decide' | 'chime' | 'tick' | 'ping' | 'deny' | 'print' | 'horn';

const KEY = 'parada-sound';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let engine: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null = null;
let enabled = false;
const subs = new Set<(on: boolean) => void>();

const ensure = () => {
  if (ctx) return ctx.state === 'suspended' ? void ctx.resume() : undefined;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
};

const tone = (f0: number, f1: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, at = 0) => {
  const c = ctx!;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.05);
};

const noise = (dur: number, f0: number, f1: number, vol = 0.15, at = 0) => {
  const c = ctx!;
  const t = c.currentTime + at;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(t);
};

const SOUNDS: Record<Sfx, () => void> = {
  scan: () => { tone(480, 1600, 0.3, 'sine', 0.12); tone(1600, 1600, 0.05, 'square', 0.04, 0.32); },
  ocr: () => { for (let i = 0; i < 4; i++) tone(2200 + i * 120, 2200 + i * 120, 0.03, 'square', 0.035, i * 0.07); },
  whoosh: () => noise(0.5, 300, 3200, 0.22),
  decide: () => { tone(660, 660, 0.12, 'triangle', 0.14); tone(990, 990, 0.2, 'triangle', 0.14, 0.12); },
  chime: () => { tone(659, 659, 0.45, 'sine', 0.16); tone(988, 988, 0.7, 'sine', 0.12, 0.14); },
  tick: () => tone(1250, 1250, 0.06, 'square', 0.05),
  ping: () => { tone(1320, 1320, 0.16, 'sine', 0.13); tone(1760, 1760, 0.3, 'sine', 0.1, 0.1); },
  deny: () => { tone(190, 120, 0.42, 'sawtooth', 0.1); tone(150, 100, 0.42, 'square', 0.05, 0.05); },
  print: () => { for (let i = 0; i < 9; i++) noise(0.035, 3500, 3000, 0.1, i * 0.055); },
  horn: () => { tone(415, 415, 0.32, 'square', 0.06); tone(523, 523, 0.32, 'square', 0.05); },
};

export const sound = {
  get on() {
    return enabled;
  },
  init() {
    try {
      enabled = localStorage.getItem(KEY) === '1';
    } catch {}
    // Remembered "on": wait for the first gesture before creating the context (autoplay policy).
    if (enabled && !ctx) {
      const start = () => ensure();
      window.addEventListener('pointerdown', start, { once: true });
      window.addEventListener('keydown', start, { once: true });
    }
    subs.forEach((f) => f(enabled));
  },
  set(on: boolean) {
    enabled = on;
    if (on) ensure();
    else sound.engine(0);
    try {
      localStorage.setItem(KEY, on ? '1' : '0');
    } catch {}
    subs.forEach((f) => f(on));
  },
  subscribe(f: (on: boolean) => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
  play(name: Sfx) {
    if (enabled && ctx?.state === 'running') SOUNDS[name]();
  },
  // Continuous engine hum for driving; level 0..1 follows speed.
  engine(level: number) {
    if (!ctx || !master) return;
    if (!engine) {
      if (level <= 0 || !enabled) return;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(filter).connect(gain).connect(master);
      osc.start();
      engine = { osc, gain, filter };
    }
    const t = ctx.currentTime;
    const l = enabled ? Math.min(1, Math.max(0, level)) : 0;
    engine.osc.frequency.setTargetAtTime(42 + l * 70, t, 0.08);
    engine.filter.frequency.setTargetAtTime(300 + l * 900, t, 0.08);
    engine.gain.gain.setTargetAtTime(l > 0 ? 0.04 + l * 0.06 : 0, t, 0.1);
  },
};
