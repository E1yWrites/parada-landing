'use client';
// The landing page's focal moment: Zone A as a plan drawing, run by the visitor. A car drives up to the entry camera,
// the plate is read, the boom lifts and the zone count rises at the gate (never at the bay); tapping a parked car
// drives it out through the exit camera, which drops the count and prints the receipt. The three stops are stamped as
// they really happen. The gate turns cars away the way PARADA does: a plate that isn't in Philippine format is
// ignored, a plate already inside can't open a second session, and a full zone admits nobody.
// Without script the plan renders still, with every stop stamped. Under reduced motion moves are instant.
import { useEffect, useRef, useState } from 'react';
import { ZONES, STOPS, band, parkingFee } from '@/lib/content';
import { sound } from '@/lib/sfx';
import { guilloche } from './Guilloche';

const ZONE = ZONES[0];
const COLS = 15; // two rows of 15 bays either side of the aisle: Zone A's 30
// The 18 bays other drivers already hold this morning (top row 0–14, bottom row 15–29)
const TAKEN = [0, 1, 2, 3, 5, 6, 8, 11, 15, 16, 17, 18, 19, 21, 22, 24, 26, 29];
const MIN_PER_S = 5; // sim clock: one second parked counts as five minutes
const START = 'ABC 1234';

type Car = { id: number; plate: string; bay: number; since: number };
type Read = { gate: 'entry' | 'exit'; text: string; state: 'reading' | 'ok' | 'deny'; note?: string };
type Msg = { text: string; tone: 'info' | 'ok' | 'bad' };
type Slip = { plate: string; minutes: number; n: number };

const PH = /^[A-Z]{3} \d{3,4}$/;
const tidy = (s: string) => {
  const t = s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  const m = /^([A-Z]+)(\d+)$/.exec(t);
  return m ? `${m[1]} ${m[2]}` : t;
};
const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
const rnd = (n: number, from: string) => Array.from({ length: n }, () => from[Math.floor(Math.random() * from.length)]).join('');
const randomPlate = () => `${rnd(3, 'ABCDEFGHJKLMNPRSTUVWXYZ')} ${rnd(4, '0123456789')}`;
const hm = (min: number) => `${Math.floor(min / 60)}:${String(Math.round(min % 60)).padStart(2, '0')}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function GateSim() {
  const [ready, setReady] = useState(false);
  const [plate, setPlate] = useState(START);
  const [cars, setCars] = useState<Car[]>([]);
  const [count, setCount] = useState(ZONE.occupied);
  const [busy, setBusy] = useState(false);
  const [rushing, setRushing] = useState(false);
  const halt = useRef(false); // Stop pressed during rush hour: finish the car at the gate, then stop
  const quiet = useRef(false); // the self-driving first car makes no sound: nobody asked for it
  const [done, setDone] = useState([false, false, false]);
  const [reads, setReads] = useState<{ entry: Read | null; exit: Read | null }>({ entry: null, exit: null });
  const setRead = (r: Read) => setReads((v) => ({ ...v, [r.gate]: r }));
  const [boom, setBoom] = useState({ entry: false, exit: false });
  const [msg, setMsg] = useState<Msg>({ text: 'Press Drive in to send a car to the entry camera.', tone: 'info' });
  const [slip, setSlip] = useState<Slip | null>(null);
  const [ping, setPing] = useState(0);
  const [mover, setMover] = useState<string | null>(null);

  const lot = useRef<HTMLDivElement>(null);
  const car = useRef<HTMLDivElement>(null);
  const slipRef = useRef<HTMLElement>(null);
  const bays = useRef<(HTMLDivElement | null)[]>([]);
  const alive = useRef(true);
  const touched = useRef(false);
  const state = useRef({ cars, count });
  state.current = { cars, count };

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const play = (name: Parameters<typeof sound.play>[0]) => !quiet.current && sound.play(name);

  useEffect(() => {
    alive.current = true;
    setReady(true);
    // the first time the plan comes into view, one car drives itself in so the visitor sees the gate work
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (!touched.current) {
          quiet.current = true;
          void driveIn(START, 1, true).finally(() => (quiet.current = false));
        }
      },
      { threshold: 0.55 },
    );
    if (lot.current) io.observe(lot.current);
    return () => {
      alive.current = false;
      io.disconnect();
    };
  }, []);

  // after a car leaves, its button is gone: keep keyboard focus on the receipt instead of dropping it to the page
  useEffect(() => {
    if (slip) slipRef.current?.focus({ preventScroll: true });
  }, [slip]);

  // ---------- geometry, read from the drawn plan so the car follows the CSS layout at any width ----------
  const geo = () => {
    const box = lot.current!.getBoundingClientRect();
    const lane = lot.current!.querySelector<HTMLElement>('.lane')!.getBoundingClientRect();
    const b0 = bays.current[0]!.getBoundingClientRect();
    const L = b0.height * 0.78;
    const W = b0.width * 0.62;
    return {
      L,
      W,
      y: lane.top - box.top + lane.height / 2,
      entry: lot.current!.querySelector<HTMLElement>('.boom.entry')!.getBoundingClientRect().left - box.left,
      exit: lot.current!.querySelector<HTMLElement>('.boom.exit')!.getBoundingClientRect().left - box.left,
      right: box.width,
      bay: (i: number) => {
        const r = bays.current[i]!.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, top: i < COLS };
      },
    };
  };
  const pose = (L: number, W: number, [x, y, a]: number[]) => `translate(${x - L / 2}px, ${y - W / 2}px) rotate(${a}deg)`;
  const move = async (g: { L: number; W: number }, frames: number[][], ms: number, easing = 'cubic-bezier(0.45, 0, 0.2, 1)') => {
    const el = car.current;
    if (!el || !alive.current) return;
    el.style.width = `${g.L}px`;
    el.style.height = `${g.W}px`;
    const end = pose(g.L, g.W, frames[frames.length - 1]);
    try {
      const a = el.animate(
        frames.map((f) => ({ transform: pose(g.L, g.W, f) })),
        { duration: reduced() ? 1 : ms, easing, fill: 'forwards' },
      );
      await a.finished;
      el.style.transform = end;
      a.cancel();
    } catch {
      el.style.transform = end;
    }
  };
  // OCR, as the visitor sees it: characters settle left to right
  const scan = async (gate: Read['gate'], text: string, ms: number) => {
    play('scan');
    if (reduced()) {
      setRead({ gate, text, state: 'reading' });
      return;
    }
    const t0 = performance.now();
    while (alive.current) {
      const f = Math.min(1, (performance.now() - t0) / ms);
      const locked = Math.floor(f * text.length);
      setRead({ gate, text: [...text].map((c, i) => (c === ' ' || i < locked ? c : rnd(1, GLYPHS))).join(''), state: 'reading' });
      if (f >= 1) break;
      await sleep(45);
    }
    play('ocr');
  };
  const stamp = (i: number) => setDone((d) => (d[i] ? d : d.map((v, j) => v || j === i)));

  // ---------- the entry gate ----------
  const driveIn = async (p: string, pace = 1, auto = false, keep = false) => {
    setBusy(true);
    const release = () => !keep && setBusy(false);
    const g = geo();
    const stop = g.entry - g.L / 2 - 6;
    setMover(p);
    setMsg({ text: `${p || 'A car'} pulls up to the entry camera.`, tone: 'info' });
    await move(g, [[-g.L, g.y, 0], [stop, g.y, 0]], 800 * pace, 'cubic-bezier(0.16, 1, 0.3, 1)');
    const { cars: now, count: n } = state.current;
    const reason = !PH.test(p)
      ? 'Not a Philippine plate, so the camera ignores it.'
      : now.some((c) => c.plate === p)
        ? `${p} is already parked inside. One plate, one open session.`
        : n >= ZONE.capacity
          ? 'Zone A is full. The gate stays shut; the app shows drivers where there is room.'
          : null;
    const seen = PH.test(p) ? p : rnd(Math.max(3, Math.min(7, p.replace(' ', '').length)), GLYPHS); // a non-plate reads as noise
    await scan('entry', seen, 650 * pace);
    if (!alive.current) return;
    if (reason) {
      setRead({ gate: 'entry', text: seen, state: 'deny', note: PH.test(p) ? 'Turned away' : 'No plate read' });
      setMsg({ text: reason, tone: 'bad' });
      play('deny');
      await sleep(reduced() ? 0 : 650 * pace);
      await move(g, [[stop, g.y, 0], [-g.L, g.y, 0]], 650 * pace);
      setMover(null);
      release();
      return false;
    }
    // accepted at the gate: the count rises here, before the car reaches any bay
    setRead({ gate: 'entry', text: p, state: 'ok', note: 'Entry · plate accepted' });
    setBoom((b) => ({ ...b, entry: true }));
    play('decide');
    stamp(0);
    setCount((c) => c + 1);
    setPing((v) => v + 1);
    setTimeout(() => {
      if (!alive.current) return;
      stamp(1);
      play('chime');
    }, reduced() ? 0 : 380 * pace);
    if (!auto) document.documentElement.style.setProperty('--guilloche-bg', guilloche(p)); // every pass reprints from the plate
    const taken = new Set([...TAKEN, ...state.current.cars.map((c) => c.bay)]);
    const free = Array.from({ length: ZONE.capacity }, (_, i) => i).filter((i) => !taken.has(i));
    const bay = free[0];
    const b = g.bay(bay);
    await move(g, [[stop, g.y, 0], [b.x - g.L * 0.55, g.y, 0]], (350 + Math.abs(b.x - stop) * 1.6) * pace);
    setBoom((v) => ({ ...v, entry: false }));
    const s = b.top ? -1 : 1;
    await move(g, [[b.x - g.L * 0.55, g.y, 0], [b.x - g.L * 0.1, g.y + s * g.W * 0.9, s * 50], [b.x, b.y, s * 90]], 520 * pace, 'cubic-bezier(0.3, 0, 0.2, 1)');
    if (!alive.current) return;
    setCars((c) => [...c, { id: Date.now() + Math.random(), plate: p, bay, since: performance.now() }]);
    setMover(null);
    setMsg({
      text: auto ? `${p} is parked. Your turn: type a plate and drive in, or tap the blue car to drive it out.` : `${p} is parked in Zone A. Tap it to drive it out.`,
      tone: 'ok',
    });
    release();
    return true;
  };

  // ---------- the exit gate ----------
  const driveOut = async (c: Car) => {
    touched.current = true;
    setBusy(true);
    const g = geo();
    const b = g.bay(c.bay);
    const s = b.top ? -1 : 1;
    setCars((all) => all.filter((x) => x.id !== c.id));
    setMover(c.plate);
    const stop = g.exit - g.L / 2 - 6;
    await move(g, [[b.x, b.y, s * 90], [b.x + g.L * 0.15, g.y + s * g.W * 0.6, s * 40], [b.x + g.L * 0.6, g.y, 0]], 560);
    await move(g, [[b.x + g.L * 0.6, g.y, 0], [stop, g.y, 0]], 300 + Math.abs(stop - b.x) * 1.6);
    await scan('exit', c.plate, 480);
    if (!alive.current) return;
    const minutes = Math.max(1, ((performance.now() - c.since) / 1000) * MIN_PER_S);
    setRead({ gate: 'exit', text: c.plate, state: 'ok', note: 'Exit · session closed' });
    setBoom((v) => ({ ...v, exit: true }));
    setCount((n) => n - 1);
    setPing((v) => v + 1);
    play('decide');
    await move(g, [[stop, g.y, 0], [g.right + g.L, g.y, 0]], 700, 'cubic-bezier(0.5, 0, 0.75, 0)');
    setBoom((v) => ({ ...v, exit: false }));
    setMover(null);
    setSlip((prev) => ({ plate: c.plate, minutes, n: (prev?.n ?? 0) + 1 }));
    stamp(2);
    play('print');
    setMsg({ text: `${c.plate} left through the exit camera. Zone A's count dropped back and the receipt printed.`, tone: 'ok' });
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    touched.current = true;
    if (busy) return;
    await driveIn(tidy(plate) || plate.trim());
  };
  const rush = async () => {
    touched.current = true;
    halt.current = false;
    setRushing(true);
    setBusy(true);
    while (alive.current && !halt.current && state.current.count < ZONE.capacity) {
      let p = randomPlate();
      while (state.current.cars.some((c) => c.plate === p)) p = randomPlate();
      await driveIn(p, 0.32, true, true);
    }
    // a full zone turns the next car away, so the visitor sees the gate stay shut
    if (alive.current && !halt.current) await driveIn(randomPlate(), 0.45, true, true);
    if (halt.current) setMsg({ text: `Rush hour stopped at ${state.current.count} of ${ZONE.capacity}.`, tone: 'info' });
    setRushing(false);
    setBusy(false);
  };
  const reset = () => {
    touched.current = true;
    setCars([]);
    setCount(ZONE.occupied);
    setReads({ entry: null, exit: null });
    setMsg({ text: 'Back to this morning: 18 of 30 taken.', tone: 'info' });
    document.documentElement.style.removeProperty('--guilloche-bg');
  };

  const free = ZONE.capacity - count;
  const level = band({ ...ZONE, occupied: count });
  const low = free / ZONE.capacity <= 0.2;
  const shown = (i: number) => done[i] || !ready;
  const typed = tidy(plate);
  const hint = plate && !PH.test(typed) ? 'Philippine plates are three letters and three or four numbers, like ABC 1234.' : 'Try your own plate, one that is already inside, or rush hour.';

  const cam = (g: 'entry' | 'exit') => (reads[g]?.state === 'reading' ? ' is-on' : '');

  // One sheet in three columns, one per stop: the stop's note above the plan with a leader down to its spot (entry gate,
  // the zone, exit gate), and what that stop produced below it.
  return (
    <div className="gates">
      <ol className="stamps">
        {STOPS.map((s, i) => (
          <li key={s.title} data-done={shown(i) || undefined}>
            <span className="stamp-box num" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{s.title}</h3>
            <p className="soft">{s.body}</p>
            <span className="sr-only">{shown(i) ? 'Done in the simulation.' : 'Not yet in the simulation.'}</span>
          </li>
        ))}
      </ol>

      <div className="lot" ref={lot} data-busy={busy || undefined}>
        {Array.from({ length: ZONE.capacity }, (_, i) => {
          const mine = cars.find((c) => c.bay === i);
          const other = TAKEN.includes(i);
          return (
            <div
              key={i}
              ref={(el) => void (bays.current[i] = el)}
              className={i < COLS ? 'bay top' : 'bay bottom'}
              style={{ gridColumn: (i % COLS) + 2, gridRow: i < COLS ? 1 : 3 }}
            >
              {other && <span className="parked" aria-hidden="true" />}
              {mine && (
                <button type="button" className="parked mine" disabled={busy} onClick={() => driveOut(mine)} aria-label={`Drive ${mine.plate} out through the exit camera`}>
                  <span>{mine.plate}</span>
                </button>
              )}
            </div>
          );
        })}
        <div className="lane" aria-hidden="true">
          <span className="gate-tag entry">Entry</span>
          <span className="lane-tag">Zone A</span>
          <span className="gate-tag exit">Exit</span>
        </div>
        <span className={`cam entry${cam('entry')}`} aria-hidden="true" />
        <span className={`cam exit${cam('exit')}`} aria-hidden="true" />
        <span className={`boom entry${boom.entry ? ' up' : ''}`} aria-hidden="true" />
        <span className={`boom exit${boom.exit ? ' up' : ''}`} aria-hidden="true" />
        <div ref={car} className={mover ? 'car' : 'car is-off'} aria-hidden="true" />
      </div>

      <div className="outs">
        <div className="out entry">
          <div className="sim-read" data-state={reads.entry?.state ?? 'idle'}>
            <span className="label">Entry camera</span>
            <span className="plate-read num">{reads.entry?.text ?? '— — —'}</span>
            <small>{reads.entry?.note ?? 'Waiting for a car'}</small>
          </div>
          <form className="drive-form" onSubmit={submit}>
            <label className="plate-field">
              <span className="label">Your plate</span>
              <input
                className="num"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 9))}
                onBlur={() => setPlate((v) => tidy(v) || v)}
                maxLength={9}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="go"
                aria-describedby="plate-hint"
                aria-invalid={(!!plate && !PH.test(typed)) || undefined}
              />
            </label>
            <button type="submit" className="btn primary" disabled={!ready || busy}>
              Drive in
            </button>
            <small id="plate-hint" className="hint">
              {hint}
            </small>
          </form>
        </div>

        <div className="out zone">
          <div className="sim-count" data-band={level}>
            <span className="label">Zone A occupied</span>
            <span className="num big">
              {count}/{ZONE.capacity}
            </span>
            <span className="meter" aria-hidden="true">
              <i style={{ transform: `scaleX(${count / ZONE.capacity})` }} />
            </span>
          </div>
          <div className="screens" aria-hidden="true">
            <span key={`d${ping}`} className={ping ? 'screen flash' : 'screen'}>
              <b>Driver app</b> {free} free
            </span>
            <span key={`a${ping}`} className={ping ? 'screen flash' : 'screen'} data-alert={low || undefined}>
              <b>Dashboard</b> {count >= ZONE.capacity ? 'Zone A full' : low ? `Low · ${free} of ${ZONE.capacity} free` : `${count}/${ZONE.capacity}`}
            </span>
          </div>
          <p className="sim-msg" data-tone={msg.tone} role="status" aria-live="polite">
            {msg.text}
          </p>
          <div className="sim-more">
            {rushing ? (
              <button type="button" className="link-btn" onClick={() => (halt.current = true)}>
                Stop
              </button>
            ) : (
              <button type="button" className="link-btn" disabled={!ready || busy || count >= ZONE.capacity} onClick={rush}>
                Rush hour
              </button>
            )}
            <button type="button" className="link-btn" disabled={!ready || busy} onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        <div className="out exit">
          <div className="sim-read" data-state={reads.exit?.state ?? 'idle'}>
            <span className="label">Exit camera</span>
            <span className="plate-read num">{reads.exit?.text ?? '— — —'}</span>
            <small>{reads.exit?.note ?? 'Waiting for a car'}</small>
          </div>
          {slip ? (
            <section key={slip.n} ref={slipRef} tabIndex={-1} className="receipt" aria-label="Receipt from the exit camera">
              <h3>Session closed</h3>
              <span className="stamped" aria-hidden="true">
                Exited
                <small>cam-a-exit</small>
              </span>
              <dl>
                <dt>Plate</dt>
                <dd>{slip.plate}</dd>
                <dt>Zone</dt>
                <dd>{ZONE.name}</dd>
                <dt>Time parked</dt>
                <dd>{hm(slip.minutes)}</dd>
                <dt>Fee</dt>
                <dd>₱{parkingFee(slip.minutes)}</dd>
              </dl>
              <p>Demo receipt at the prototype&rsquo;s default rate; one second here is five minutes. Your site sets its own rates.</p>
            </section>
          ) : (
            <p className="receipt-empty">Tap a blue car to drive it out. Its receipt prints here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
