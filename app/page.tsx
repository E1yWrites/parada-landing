import Link from 'next/link';
import { ZONES, band, PIPELINE, PROBLEMS, MOBILE_STEPS, ADMIN_VERBS, ARCHITECTURE, EMAIL, GITHUB_URL } from '@/lib/content';
import Tally from '@/components/Tally';
import { DriveIn, DriveSetup } from '@/components/DriveIn';

export default function Home() {
  return (
    <>
      <section className="chapter hero" data-cam="hero" aria-labelledby="hero-title">
        <div className="board">
          <h1 id="hero-title" className="wordmark">PARADA</h1>
          <p className="headline">Smart parking, designed for smarter campuses.</p>
          <p>
            Cameras at the zone gates read your plate, and every zone keeps its own live count, so you know where
            there&rsquo;s room before you reach the gate.
          </p>
          <div className="actions">
            <DriveIn />
            <a className="btn" href="#how">Watch the trip</a>
          </div>
          <ol className="chain route-line" aria-label="The route">
            <li>Entry</li>
            <li>Zone A · B · C</li>
            <li>Exit</li>
          </ol>
          <Tally />
          <p className="fine">Demo figures · a BSIT capstone project, Lyceum of the Philippines University — Batangas</p>
        </div>
      </section>

      <section id="about" className="chapter right" data-cam="about" aria-labelledby="about-title">
        <div className="board">
          <h2 id="about-title">What is PARADA?</h2>
          <p>
            PARADA is a mobile and web-based smart parking management system designed to help drivers and parking
            administrators understand, manage, and monitor parking availability through a unified platform.
          </p>
          <ul className="zones" aria-label="Zone occupancy (demo figures)">
            {ZONES.map((z) => (
              <li key={z.code} data-band={band(z)} style={{ '--pct': `${(z.occupied / z.capacity) * 100}%` } as React.CSSProperties}>
                <b>{z.name}</b>
                <span className="num">
                  {z.occupied}/{z.capacity}
                </span>
                <span className="meter" aria-hidden="true">
                  <i />
                </span>
                <small>{z.capacity - z.occupied} available</small>
              </li>
            ))}
          </ul>
          <h3>Why zones, not slots?</h3>
          <p className="soft">
            PARADA treats the parking zone as the authoritative unit of availability. Physical parking spaces can still
            exist as inventory or layout information, but operational occupancy is represented at the zone level — this
            keeps the system accurate with standard gate cameras instead of a sensor on every slot.
          </p>
        </div>
      </section>

      <section id="problem" className="chapter" data-cam="problem" aria-labelledby="problem-title">
        <div className="board wide">
          <h2 id="problem-title">Parking should be easier to understand.</h2>
          <dl className="who">
            {PROBLEMS.map((p) => (
              <div key={p.who}>
                <dt>{p.who}</dt>
                <dd>{p.text}</dd>
              </div>
            ))}
          </dl>
          <p className="headline small">PARADA brings these activities together through one connected system.</p>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title">
        <div className="how-head">
          <div className="board">
            <h2 id="how-title">From arrival to receipt, one pipeline.</h2>
            <p className="soft">Keep scrolling: one car rides the loop from the entry gate to the exit gate, and the system works at every stop.</p>
          </div>
        </div>
        <ol className="steps">
          {PIPELINE.map((s, i) => (
            <li key={s.id} className={i % 2 ? 'step right' : 'step'} data-cam={s.id}>
              <div className="board">
                <h3>
                  <span className="stop num" aria-label={`Step ${i + 1} of ${PIPELINE.length}:`}>{i + 1}</span>
                  {s.title}
                </h3>
                <p className="soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="guest" className="chapter right" data-cam="guest" aria-labelledby="guest-title">
        <div className="board red">
          <h2 id="guest-title">Guest admission is a policy decision, not a default.</h2>
          <p>
            Guest admission is controlled by establishment-defined policies rather than treating every unidentified
            vehicle as automatically authorized.
          </p>
        </div>
      </section>

      <section id="play" className="chapter" data-cam="play" aria-labelledby="play-title">
        <div className="board">
          <h2 id="play-title">Now you drive.</h2>
          <p className="needs-webgl">
            Pull up at the entry gate, let the camera read your plate, park in any zone and leave through the exit.
            Try a guest plate with the policy set to deny.
          </p>
          <p className="no-webgl">
            Drive mode needs WebGL, which this browser has turned off. The pipeline above walks through the same trip.
          </p>
          <div className="needs-webgl">
            <DriveSetup />
            <div className="actions">
              <DriveIn label="Drive in" />
            </div>
            <p className="fine">Keyboard: WASD or arrow keys, Space to brake, Esc to leave. On a phone, use the on-screen pedals.</p>
          </div>
        </div>
      </section>

      <section id="apps" className="chapter right" data-cam="apps" aria-labelledby="apps-title">
        <div className="board wide">
          <h2 id="apps-title">Parking from the driver&rsquo;s perspective.</h2>
          <ol className="route">
            {MOBILE_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="stop num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p className="soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <h3 className="sub">A control center for parking operations.</h3>
          <p className="soft">
            Administrators work in the web application; drivers use the mobile app. The dashboard is the operational
            surface for zones, cameras, sessions and anomalies.
          </p>
          <dl className="who four">
            {ADMIN_VERBS.map((v) => (
              <div key={v.title}>
                <dt>{v.title}</dt>
                <dd>{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="architecture" className="chapter" data-cam="arch" aria-labelledby="arch-title">
        <div className="board">
          <h2 id="arch-title">The same journey, seen technically.</h2>
          <p className="soft">
            A camera event travels through vision/OCR into the API, which resolves identity, occupancy and sessions,
            persists them, and propagates the new state to both clients.
          </p>
          <ol className="chain" aria-label="Architecture nodes">
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
        <div className="board">
          <h2 id="contact-title">Interested in PARADA?</h2>
          <p className="soft">
            Learn more about the project, explore the architecture, or get in touch with the team behind the system.
          </p>
          <p className="soft">
            PARADA is a capstone prototype. The OCR / computer vision model, real-time integration and accuracy
            evaluation are still in progress — <Link href="/technical/#status">see the current status</Link>.
          </p>
          <div className="actions">
            <a className="btn primary" href={GITHUB_URL} rel="noopener">GitHub</a>
            <a className="btn" href={`mailto:${EMAIL}`}>Email the team</a>
          </div>
          <p className="fine num">{EMAIL}</p>
        </div>
      </section>
    </>
  );
}
