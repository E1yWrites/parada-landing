import Link from 'next/link';
import {
  ZONES, band, PIPELINE, MOBILE_STEPS, ADMIN_VERBS, ARCHITECTURE, EMAIL, GITHUB_URL, repoFile,
  THESIS, PROBLEM, PRIOR, CAMERA_WORK, INTERVIEW, OBJECTIVES, SCOPE, ROADMAP, CONTEXT, RESULTS,
  CONCLUSIONS, RECOMMENDATIONS,
} from '@/lib/content';
import LoadStatus from '@/components/LoadStatus';
import SnapPop from '@/components/SnapPop';
import Strip from '@/components/Strip';
import AppScreens from '@/components/AppScreens';
import Tally from '@/components/Tally';
import { DriveIn, DriveSetup, PassFields } from '@/components/DriveIn';

// The home page is the final defense: the title, PARADA in four sideways panels, then the case: the problem, what
// was tried, the idea, the plan, the trip that proves it, and what was measured. One section per page turn.
const ZONE_A = ZONES[0];

export default function Home() {
  return (
    <>
      <SnapPop />
      {/* title: the thesis as the paper's cover states it, while the campus model loads behind it */}
      <section className="intro" data-cam="intro" data-snap aria-labelledby="intro-title">
        <div className="intro-mascot" aria-hidden="true">
          <img src="/brand/mascot-calm.webp" alt="" width={320} height={313} />
          <img src="/brand/mascot-blink.webp" alt="" width={320} height={313} className="blink" />
        </div>
        <div className="intro-copy">
          <h1 id="intro-title" className="thesis">
            <img src="/brand/logo.webp" alt="PARADA:" width={900} height={119} />
            <span>{THESIS.title.replace(/^PARADA:\s*/, '')}</span>
          </h1>
          <p className="byline">
            {THESIS.kind} · {THESIS.degree} · {THESIS.school} · {THESIS.date}
          </p>
          <ul className="proponents" aria-label="Proponents">
            {THESIS.proponents.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <LoadStatus />
        </div>
      </section>

      {/* PARADA in four panels, side by side */}
      <Strip id="start" stops={['hero', 'about', 'drivers', 'admins']} label="PARADA at a glance">
        <div className="strip-panel chapter hero">
          <div className="board">
            <div className="pass-band">
              <span className="brand-mark" aria-hidden="true">
                <img src="/brand/mark.webp" alt="" width={160} height={160} />
              </span>
              Smart parking pass
              <span className="slot" aria-hidden="true" />
              <span className="num">LPU-B</span>
            </div>
            <h2 className="wordmark">
              <img src="/brand/logo.webp" alt="PARADA" width={900} height={119} />
            </h2>
            <p className="headline">Smart parking, designed for smarter campuses.</p>
            <p>
              Cameras at the zone gates read your plate, and every zone keeps its own live count, so you know where
              there&rsquo;s room before you reach the gate.
            </p>
            <PassFields />
            <div className="actions">
              <DriveIn />
              <a className="btn" href="#how">Watch the trip</a>
            </div>
            <Tally />
            <p className="fine">Demo figures · a BSIT capstone project, Lyceum of the Philippines University — Batangas</p>
          </div>
        </div>

        <div className="strip-panel chapter right">
          <div className="board">
            <h2>What is PARADA?</h2>
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
            <p className="fine">Demo figures</p>
          </div>
        </div>

        <div className="strip-panel chapter">
          <div className="board wide">
            <h2>Parking from the driver&rsquo;s seat.</h2>
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
          </div>
        </div>

        <div className="strip-panel chapter right">
          <div className="board">
            <h2>A control center for parking operations.</h2>
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
        </div>
      </Strip>

      {/* ---------- the problem ---------- */}
      <section id="background" className="chapter right" data-cam="background" data-snap aria-labelledby="background-title">
        <div className="board">
          <h2 id="background-title">Limited spaces, counted by eye.</h2>
          <p>
            Parking is a common challenge in universities, where many vehicles share a limited number of spaces. When
            parking information is handled mainly through manual observation, drivers can&rsquo;t tell which areas have
            room, and administrators have little real-time information about the facility.
          </p>
          <p className="cite">Channamallu et al., 2025 · Kumar &amp; Rajesh, 2024 · Reddy et al., 2025</p>
          <p className="fine">Behind this card: LPU-Batangas Main Campus, numbered as on the university map.</p>
        </div>
      </section>

      <section id="problem" className="chapter" data-cam="problem" data-snap aria-labelledby="problem-title">
        <div className="board wide">
          <h2 id="problem-title">Statement of the problem.</h2>
          <p className="general">{PROBLEM.general}</p>
          <ol className="problems">
            {PROBLEM.specific.map((p, i) => (
              <li key={i}>
                <span className="stop num" aria-hidden="true">{i + 1}</span>
                <p>{p.text}</p>
                <small>Objective {p.answer}</small>
              </li>
            ))}
          </ol>
          <p className="cite">From the Introduction · each problem tagged with the specific objective that answers it</p>
        </div>
      </section>

      <section id="prior" className="chapter right" data-cam="prior" data-snap aria-labelledby="prior-title">
        <div className="board wide">
          <h2 id="prior-title">It has been tried here before, with a sensor in every space.</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Study</th>
                <th scope="col">Where</th>
                <th scope="col">How it senses</th>
              </tr>
            </thead>
            <tbody>
              {PRIOR.map((r) => (
                <tr key={r.who}>
                  <th scope="row">{r.who}</th>
                  <td>{r.where}</td>
                  <td>{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="soft">They cut down manual monitoring, and every one of them needs physical components throughout the facility.</p>
        </div>
      </section>

      <section id="sensors" className="chapter" data-cam="sensors" data-snap aria-labelledby="sensors-title">
        <div className="board">
          <h2 id="sensors-title">Every space you add is one more sensor to install and maintain.</h2>
          <p>
            Sensor systems grow with the lot: more sensors, wiring, controllers and maintenance as spaces are added, a
            real cost for small to medium-sized facilities.
          </p>
          <p className="cite">Muthupriya et al., 2024 · Reddy et al., 2025 · Kadhim et al., 2021</p>
          <p className="label compare-head">Zone A in this model · {ZONE_A.capacity} spaces</p>
          <dl className="fields" style={{ '--cols': 2 } as React.CSSProperties}>
            <div className="field" data-state="void">
              <dt>A sensor per space</dt>
              <dd className="num">{ZONE_A.capacity} sensors</dd>
            </div>
            <div className="field">
              <dt>A camera per gate</dt>
              <dd className="num">2 cameras</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="cameras" className="chapter right" data-cam="cameras" data-snap aria-labelledby="cameras-title">
        <div className="board wide">
          <h2 id="cameras-title">Cameras see a whole area. They only need a good view.</h2>
          <p>
            Camera monitoring reads a larger area instead of putting a device in every space, and Philippine studies
            already use it on vehicles and plates:
          </p>
          <dl className="who rows">
            {CAMERA_WORK.map((c) => (
              <div key={c.who}>
                <dt>{c.who}</dt>
                <dd>{c.text}</dd>
              </div>
            ))}
          </dl>
          <p className="soft">The catch: results depend on camera position, viewing angle, lighting and image quality.</p>
          <p className="cite">Badidi et al., 2023 · Sharma &amp; Kanwal, 2024</p>
        </div>
      </section>

      {/* ---------- the idea ---------- */}
      <section id="insight" className="chapter" data-cam="insight" data-snap aria-labelledby="insight-title">
        <div className="board">
          <h2 id="insight-title">So we count at the zone gate, not at the space.</h2>
          <p>
            A vehicle can only enter or leave a zone through its gates. A standard camera at each gate reads the plate
            as the car passes, and one transaction changes the zone&rsquo;s count and the parking session.
          </p>
          <p className="soft">
            Spaces stay as layout; occupancy lives at the zone. And at a gate every car meets the camera at the same spot
            and angle, the conditions camera systems depend on.
          </p>
        </div>
      </section>

      <section id="interview" className="chapter right" data-cam="interview" data-snap aria-labelledby="interview-title">
        <div className="board wide">
          <h2 id="interview-title">We asked the campus, then cut the scope.</h2>
          <dl className="fields" style={{ '--cols': 2 } as React.CSSProperties}>
            <div className="field">
              <dt>Interview requested</dt>
              <dd>{INTERVIEW.date}</dd>
            </div>
            <div className="field">
              <dt>With</dt>
              <dd>{INTERVIEW.with}, AVP for Student Services</dd>
            </div>
          </dl>
          <dl className="fields titles" style={{ '--cols': 1 } as React.CSSProperties}>
            <div className="field" data-state="void">
              <dt>Working title</dt>
              <dd>{INTERVIEW.oldTitle}</dd>
            </div>
            <div className="field">
              <dt>Title now</dt>
              <dd>{THESIS.title}</dd>
            </div>
          </dl>
          <p className="label">Left out after the refinement</p>
          <ul className="struck">
            {INTERVIEW.excluded.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- the plan ---------- */}
      <section id="objectives" className="chapter" data-cam="objectives" data-snap aria-labelledby="objectives-title">
        <div className="board wide">
          <h2 id="objectives-title">Objectives of the study.</h2>
          <p className="general">{OBJECTIVES.general}</p>
          <ol className="objectives">
            {OBJECTIVES.specific.map((o, i) => (
              <li key={i}>
                <span className="stop num" aria-hidden="true">{i + 1}</span>
                <p>{o}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="scope" className="chapter right" data-cam="scope" data-snap aria-labelledby="scope-title">
        <div className="board wide">
          <h2 id="scope-title">Scope and delimitations.</h2>
          <div className="split">
            <div>
              <p className="label">Covers</p>
              <ul className="ruled">
                {SCOPE.covers.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Leaves out</p>
              <ul className="ruled struck-rows">
                {SCOPE.leaves.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="method" className="chapter" data-cam="method" data-snap aria-labelledby="method-title">
        <div className="board wide">
          <h2 id="method-title">Agile, built in seventeen phases.</h2>
          <p className="soft">
            Each phase runs objective, implement, test, fix, typecheck, lint, build, document, then stops. Phases 0–14 are
            done; deployment and the final review come next.
          </p>
          <ol className="phases">
            {ROADMAP.map(([n, title, done]) => (
              <li key={n} data-state={done ? undefined : 'pending'}>
                <span className="num">{n}</span>
                {title}
              </li>
            ))}
          </ol>
          <p className="cite">Source: the PARADA repository, docs/architecture/roadmap.md</p>
        </div>
      </section>

      <section id="context" className="chapter right" data-cam="context" data-snap aria-labelledby="context-title">
        <div className="board wide">
          <h2 id="context-title">One backend, three outside parties.</h2>
          <p className="soft">Every change goes through the API; live updates reach both clients over Server-Sent Events.</p>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Party</th>
                <th scope="col">Into PARADA</th>
                <th scope="col">Out of PARADA</th>
              </tr>
            </thead>
            <tbody>
              {CONTEXT.map((r) => (
                <tr key={r.who}>
                  <th scope="row">{r.who}</th>
                  <td>{r.gives}</td>
                  <td>{r.gets || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="architecture" className="chapter" data-cam="arch" data-snap aria-labelledby="arch-title">
        <div className="board wide">
          <h2 id="arch-title">The same journey, seen technically.</h2>
          <p className="soft">
            A camera event travels through vision/OCR into the API, which resolves identity, occupancy and sessions,
            persists them, and propagates the new state to both clients.
          </p>
          <ol className="nodes" aria-label="Architecture nodes">
            {ARCHITECTURE.map((n) => (
              <li key={n.id}>
                <b>{n.name}</b>
                <small>{n.tech}</small>
              </li>
            ))}
          </ol>
          <div className="actions">
            <Link className="btn" href="/technical/">Full technical overview</Link>
          </div>
        </div>
      </section>

      {/* ---------- the proof: one car through Zone A ---------- */}
      <section id="how" aria-labelledby="how-title">
        <div className="how-head" data-cam="how" data-snap>
          <div className="board">
            <h2 id="how-title">How it answers the problem: one car, two gates.</h2>
            <p className="soft">Keep going: one car rides Zone A from the entry camera to the exit camera, and the system works at every stop.</p>
          </div>
        </div>
        <ol className="steps">
          {PIPELINE.map((s, i) => (
            <li key={s.id} className={`${i % 2 ? 'step right' : 'step'}${s.id === 'clients' ? ' with-apps' : ''}`} data-cam={s.id} data-snap>
              <div className="board">
                <h3>
                  <span className="stop num" aria-label={`Step ${i + 1} of ${PIPELINE.length}:`}>{i + 1}</span>
                  {s.title}
                </h3>
                <p className="soft">{s.body}</p>
                <p className="why">{s.why}</p>
              </div>
              {s.id === 'clients' && <AppScreens />}
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- what was measured ---------- */}
      <section id="results" className="chapter right" data-cam="results" data-snap aria-labelledby="results-title">
        <div className="board wide">
          <h2 id="results-title">What we measured.</h2>
          <dl className="fields results" style={{ '--cols': 3 } as React.CSSProperties}>
            {RESULTS.fields.map((f) => (
              <div key={f.label} className="field">
                <dt>{f.label}</dt>
                <dd className="num">{f.value}</dd>
                <small>{f.note}</small>
              </div>
            ))}
          </dl>
          <p className="soft">
            Synthetic dataset: {RESULTS.dataset}. Measured {RESULTS.date}.
          </p>
          <p className="cite">
            Source: <a href={repoFile('docs/vision/phase14-evaluation.md')} rel="noopener">docs/vision/phase14-evaluation.md</a>
          </p>
        </div>
      </section>

      <section id="limits" className="chapter" data-cam="limits" data-snap aria-labelledby="limits-title">
        <div className="board wide">
          <h2 id="limits-title">Where it breaks, and what isn&rsquo;t proven yet.</h2>
          <p className="soft">{RESULTS.strong}</p>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Condition</th>
                <th scope="col">Exact reads</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.weak.map((w) => (
                <tr key={w.cond}>
                  <th scope="row">{w.cond}</th>
                  <td className="num">{w.value}</td>
                  <td>{w.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="ruled">
            {RESULTS.limits.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="conclusion" className="chapter right" data-cam="conclusion" data-snap aria-labelledby="conclusion-title">
        <div className="board wide">
          <h2 id="conclusion-title">Conclusions and recommendations.</h2>
          <div className="split">
            <div>
              <p className="label">We conclude</p>
              <ul className="ruled">
                {CONCLUSIONS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">We recommend</p>
              <ol className="ruled counted">
                {RECOMMENDATIONS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="play" className="chapter" data-cam="play" data-snap aria-labelledby="play-title">
        <div className="board">
          <h2 id="play-title">Live demo: you drive.</h2>
          <p className="needs-webgl">
            Zone A counts cars at its gate cameras, not at the bays. Pull up under the entry canopy, let the camera read
            your plate and watch the count go up; leave through the north gate&rsquo;s exit camera to close the session.
            Try the guest plate: under the primary-zone policy guests may only use Zone C, so Zone A turns them away.
          </p>
          <p className="no-webgl">
            Drive mode needs WebGL, which this browser has turned off. The trip above walks through the same steps.
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

      <section id="contact" className="chapter" data-cam="contact" data-snap aria-labelledby="contact-title">
        <div className="board">
          <h2 id="contact-title">Thank you. Questions?</h2>
          <ul className="proponents" aria-label="Proponents">
            {THESIS.proponents.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
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
