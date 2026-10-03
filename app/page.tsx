import Link from 'next/link';
import { ZONES, band, PIPELINE, PROBLEMS, MOBILE_STEPS, ADMIN_VERBS, ARCHITECTURE, EMAIL, GITHUB_URL } from '@/lib/content';

const BAND_COLOR = { free: 'var(--free)', busy: 'var(--busy)', full: 'var(--full)' };
const pad = (n: number) => String(n).padStart(2, '0');

export default function Home() {
  return (
    <>
      <section className="chapter hero" data-cam="hero" aria-labelledby="hero-title">
        <div className="panel">
          <span className="eyebrow">Capstone project · LPU Batangas</span>
          <h1 id="hero-title">PARADA</h1>
          <p className="lead">Smart parking, designed for smarter campuses.</p>
          <div className="actions">
            <a className="btn primary" href="#how">See how it works</a>
            <a className="btn" href="#play">Try it yourself</a>
          </div>
          <p className="tag">BS Information Technology</p>
        </div>
      </section>

      <section id="about" className="chapter right" data-cam="about" aria-labelledby="about-title">
        <div className="panel">
          <span className="eyebrow">01 · About</span>
          <h2 id="about-title">What is PARADA?</h2>
          <p>
            PARADA is a mobile and web-based smart parking management system designed to help drivers and parking
            administrators understand, manage, and monitor parking availability through a unified platform.
          </p>
          <ul className="zones" aria-label="Zone occupancy">
            {ZONES.map((z) => (
              <li key={z.code} className="zone-row" style={{ '--c': BAND_COLOR[band(z)], '--pct': `${(z.occupied / z.capacity) * 100}%` } as React.CSSProperties}>
                <b>{z.name}</b>
                <span className="num">
                  {z.occupied} / {z.capacity} occupied · {z.capacity - z.occupied} available
                </span>
                <span className="meter" aria-hidden="true"><i /></span>
              </li>
            ))}
          </ul>
          <h3>Why zone-based?</h3>
          <p className="muted">
            PARADA treats the parking zone as the authoritative unit of availability. Physical parking spaces can still
            exist as inventory or layout information, but operational occupancy is represented at the zone level — this
            keeps the system accurate with standard gate cameras instead of a sensor on every slot.
          </p>
        </div>
      </section>

      <section id="problem" className="chapter" data-cam="problem" aria-labelledby="problem-title">
        <div className="panel wide">
          <span className="eyebrow">02 · The problem</span>
          <h2 id="problem-title">Parking should be easier to understand.</h2>
          <div className="cards">
            {PROBLEMS.map((p) => (
              <div key={p.who} className="card">
                <h3>{p.who}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
          <p className="lead" style={{ marginTop: '1.25rem' }}>PARADA brings these activities together through one connected system.</p>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title">
        <div className="how-head">
          <span className="eyebrow">03 · How it works</span>
          <h2 id="how-title">From arrival to receipt, one pipeline.</h2>
        </div>
        <ol className="steps">
          {PIPELINE.map((s, i) => (
            <li key={s.id} className={i % 2 ? 'step right' : 'step'} data-cam={s.id}>
              <div className="panel">
                <span className="step-no">{pad(i + 1)} / 09</span>
                <h3>{s.title}</h3>
                <p className="muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="guest" className="chapter right" data-cam="guest" aria-labelledby="guest-title">
        <div className="panel">
          <span className="eyebrow">04 · Registered vehicle vs. guest</span>
          <h2 id="guest-title">Guest admission is a policy decision, not a default.</h2>
          <p className="muted">
            Guest admission is controlled by establishment-defined policies rather than treating every unidentified
            vehicle as automatically authorized.
          </p>
        </div>
      </section>

      <section id="play" className="chapter" data-cam="play" aria-labelledby="play-title">
        <div className="panel">
          <span className="eyebrow">05 · Interactive demo</span>
          <h2 id="play-title">See the system in action.</h2>
          <p className="muted">Watch a vehicle move through capture, OCR, resolution, and exit.</p>
        </div>
      </section>

      <section id="apps" className="chapter right" data-cam="apps" aria-labelledby="apps-title">
        <div className="panel wide">
          <span className="eyebrow">06 · Mobile + admin</span>
          <h2 id="apps-title">Parking from the driver&rsquo;s perspective.</h2>
          <ol className="cards">
            {MOBILE_STEPS.map((s, i) => (
              <li key={s.title} className="card">
                <span className="step-no">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <h3 style={{ marginTop: '2rem', fontSize: 'var(--step-2)' }}>A control center for parking operations.</h3>
          <p className="muted">
            Administrators work in the web application; drivers use the mobile app. The dashboard is the operational
            surface for zones, cameras, sessions and anomalies.
          </p>
          <div className="cards">
            {ADMIN_VERBS.map((v) => (
              <div key={v.title} className="card">
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="chapter" data-cam="arch" aria-labelledby="arch-title">
        <div className="panel">
          <span className="eyebrow">07 · System architecture</span>
          <h2 id="arch-title">The same journey, seen technically.</h2>
          <p className="muted">
            A camera event travels through vision/OCR into the API, which resolves identity, occupancy and sessions,
            persists them, and propagates the new state to both clients.
          </p>
          <ol className="chips" aria-label="Architecture nodes">
            {ARCHITECTURE.map((n) => (
              <li key={n.id}>{n.name}</li>
            ))}
          </ol>
          <div className="actions">
            <Link className="btn" href="/technical/">Full technical overview</Link>
          </div>
        </div>
      </section>

      <section id="contact" className="chapter" data-cam="contact" aria-labelledby="contact-title">
        <div className="panel">
          <span className="eyebrow">08 · Contact</span>
          <h2 id="contact-title">Interested in PARADA?</h2>
          <p className="muted">
            Learn more about the project, explore the architecture, or get in touch with the team behind the system.
          </p>
          <p className="muted">
            PARADA is a capstone prototype. The OCR / computer vision model, real-time integration and accuracy
            evaluation are still in progress — <Link href="/technical/#status">see the current status</Link>.
          </p>
          <div className="actions">
            <a className="btn primary" href={GITHUB_URL} rel="noopener">GitHub</a>
            <a className="btn" href={`mailto:${EMAIL}`}>Email</a>
          </div>
        </div>
      </section>
    </>
  );
}
