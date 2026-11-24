import Link from 'next/link';
import {
  ZONES, band, PIPELINE, MOBILE_STEPS, ADMIN_VERBS, ARCHITECTURE, EMAIL, GITHUB_URL, THESIS, PROBLEM, SCOPE, OBJECTIVES,
  PRIOR, CAMERA_WORK, APPS, GAP, AGILE, ROADMAP, TIMELINE, ETHICS, CONTEXT, PROCESSES, USE_CASES, ERD, RESULTS, TESTS,
  ACCURACY, LIVE, SPEED, UAT, LIMITS, CONCLUSIONS, OVERALL, RECOMMENDATIONS,
} from '@/lib/content';
import LoadStatus from '@/components/LoadStatus';
import SnapPop from '@/components/SnapPop';
import Strip from '@/components/Strip';
import AppScreens from '@/components/AppScreens';
import Tally from '@/components/Tally';
import { DriveIn, DriveSetup, PassFields } from '@/components/DriveIn';

// The home page is the final defense, in the paper's chapter order: the title page, PARADA in four sideways panels, then
// 1.0 Introduction, 2.0 Literature Review, 3.0 Methods, 4.0 Results and Discussion (the system, the trip, the tests),
// 5.0 Conclusions and Recommendations, the live demo and questions. One section per page turn; each slide names its source.
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
          <p className="byline">Adviser: {THESIS.adviser}</p>
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
              A mobile and web-based smart guided parking system for small to medium-sized facilities with several
              parking zones. Instead of a sensor in every space, standard cameras at zone entry and exit gates read plates
              with OCR to keep each zone&rsquo;s occupancy.
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

      {/* ================= 1.0 INTRODUCTION ================= */}
      <section id="background" className="chapter right" data-cam="background" data-snap aria-labelledby="background-title">
        <div className="board">
          <h2 id="background-title">Limited spaces, counted by eye.</h2>
          <p>
            Parking is a common challenge in universities and other facilities where many vehicles need to use a limited
            number of parking spaces. Where it is mainly handled through manual observation, drivers may not know which
            areas have available spaces, and parking personnel may have difficulty keeping track of occupied spaces and
            parking activity.
          </p>
          <p className="soft">
            &ldquo;Nearly 30% of the urban traffic congestion occurs due to drivers searching for nearby parking
            spaces.&rdquo; The same problem appears on campuses, where growing numbers of students and faculty drive to school.
          </p>
          <p className="cite">1.0 Introduction · Jakhar et al., 2025 · Kumar &amp; Rajesh, 2024</p>
          <p className="fine">Behind this card: LPU-Batangas Main Campus, numbered as on the university map.</p>
        </div>
      </section>

      <section id="problem" className="chapter" data-cam="problem" data-snap aria-labelledby="problem-title">
        <div className="board wide">
          <h2 id="problem-title">The problem.</h2>
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
          <p className="cite">1.0 Introduction · 2.0 Literature Review · 3.0 Requirement Analysis · each problem tagged with the objective that answers it</p>
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
          <p className="cite">1.0 Introduction</p>
        </div>
      </section>

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
          <p className="cite">Objectives of the Study, verbatim</p>
        </div>
      </section>

      {/* ================= 2.0 LITERATURE REVIEW ================= */}
      <section id="prior" className="chapter right" data-cam="prior" data-snap aria-labelledby="prior-title">
        <div className="board wide">
          <h2 id="prior-title">It has been tried in the Philippines before.</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Study</th>
                <th scope="col">Where</th>
                <th scope="col">How it works</th>
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
          <p className="soft">
            Each covers one part of the process: Maristela et al. monitor occupancy and Tambong et al. show availability
            to drivers. PARADA covers the whole process, from availability and reservation to sessions, fees and violations.
          </p>
          <p className="cite">2.0 Smart Parking Systems · IoT-Based Parking Systems and Sensor Scalability</p>
        </div>
      </section>

      <section id="sensors" className="chapter" data-cam="sensors" data-snap aria-labelledby="sensors-title">
        <div className="board">
          <h2 id="sensors-title">Every space you add is one more sensor to install and maintain.</h2>
          <p>
            Sensor systems place a sensor in each parking space, so their hardware grows with the number of spaces, and
            Reddy et al. (2025) name cost, connectivity and security among the barriers to adopting them. PARADA&rsquo;s
            devices grow with the number of gates instead.
          </p>
          <p className="label compare-head">Zone A in the demo · {ZONE_A.capacity} spaces</p>
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
          <p className="cite">2.0 IoT-Based Parking Systems and Sensor Scalability · Kumar &amp; Rajesh, 2024 · Reddy et al., 2025</p>
        </div>
      </section>

      <section id="cameras" className="chapter right" data-cam="cameras" data-snap aria-labelledby="cameras-title">
        <div className="board wide">
          <h2 id="cameras-title">One camera covers a wide area. It still needs a good view.</h2>
          <p>
            Computer vision &ldquo;can provide a wide coverage area, reducing the number of sensors required,&rdquo; and
            Philippine studies already use cameras on vehicles and plates:
          </p>
          <dl className="who rows">
            {CAMERA_WORK.map((c) => (
              <div key={c.who}>
                <dt>{c.who}</dt>
                <dd>{c.text}</dd>
              </div>
            ))}
          </dl>
          <p className="soft">The catch: accuracy depends on operating conditions. In the CCTV system of Tahir et al. (2023), the lowest accuracy came from a night-time video.</p>
          <p className="cite">2.0 Camera-Based Parking Monitoring and OCR-Assisted Occupancy Detection · Fahim et al., 2021 · Tahir et al., 2023</p>
        </div>
      </section>

      <section id="apps" className="chapter" data-cam="apps" data-snap aria-labelledby="apps-title">
        <div className="board wide">
          <h2 id="apps-title">Apps that each cover one part of the job.</h2>
          <div className="split">
            {APPS.map((a) => (
              <div key={a.side}>
                <p className="label">{a.side}</p>
                <p className="soft rule-top">{a.found}</p>
                <p className="why">{a.answer}</p>
                <p className="cite">{a.cite}</p>
              </div>
            ))}
          </div>
          <p className="cite">2.0 Mobile Parking Applications, Reservation, and User Assistance · Web-Based Parking Management, Monitoring, and Analytics</p>
        </div>
      </section>

      <section id="gap" className="chapter right" data-cam="gap" data-snap aria-labelledby="gap-title">
        <div className="board wide">
          <h2 id="gap-title">What the studies leave open.</h2>
          <table className="ledger wrap">
            <thead>
              <tr>
                <th scope="col">Studies</th>
                <th scope="col">What they do</th>
              </tr>
            </thead>
            <tbody>
              {GAP.rows.map((r) => (
                <tr key={r.who}>
                  <th scope="row">{r.who}</th>
                  <td>{r.short}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="general">{GAP.statement}</p>
          <p className="cite">2.0 Web-Based Parking Management, Monitoring, and Analytics · closing synthesis</p>
        </div>
      </section>

      <section id="insight" className="chapter" data-cam="insight" data-snap aria-labelledby="insight-title">
        <div className="board">
          <h2 id="insight-title">So we count at the zone gate, not at the space.</h2>
          <p>
            PARADA counts vehicles through each zone&rsquo;s entry and exit gates and uses the plate reading to connect each
            count to a registered vehicle and parking session. Spaces are kept for layout and inventory; occupancy lives
            at the zone.
          </p>
          <p className="soft">
            Lightweight by design: a classical plate-region detector, OCR with a whole-frame fallback and a
            Philippine-format check, on an ordinary computer without a graphics processor. Frames are processed in memory
            and not stored.
          </p>
          <p className="cite">2.0 Video Analytics and Standard Camera Infrastructure · Tahir et al., 2023 · Veena &amp; Manjunath, 2025 · Ardabili et al., 2023</p>
        </div>
      </section>

      {/* ================= 3.0 METHODS ================= */}
      <section id="method" className="chapter right" data-cam="method" data-snap aria-labelledby="method-title">
        <div className="board wide">
          <h2 id="method-title">Agile: six phases, one cycle per increment.</h2>
          <ol className="agile" aria-label="Agile model phases">
            {AGILE.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <p className="soft">
            The review of each iteration feeds the requirements of the next. Each increment defined its objective, recorded
            assumptions, implemented, tested, fixed, ran type checking, linting and a full build, and documented the result
            before the next began.
          </p>
          <ol className="phases">
            {ROADMAP.map(([n, title]) => (
              <li key={n}>
                <span className="num">{n}</span>
                {title}
              </li>
            ))}
          </ol>
          <p className="cite">3.0 Methods: Agile Model (Figure 1) and Development</p>
        </div>
      </section>

      <section id="timeline" className="chapter" data-cam="timeline" data-snap aria-labelledby="timeline-title">
        <div className="board wide">
          <h2 id="timeline-title">From the proposal to the user test.</h2>
          <table className="ledger">
            <tbody>
              {TIMELINE.map(([when, what]) => (
                <tr key={when}>
                  <th scope="row" className="num">{when}</th>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cite">Gantt Chart (Figure 2): the researchers&rsquo; notes and the dated record of the project repository</p>
        </div>
      </section>

      <section id="ethics" className="chapter right" data-cam="ethics" data-snap aria-labelledby="ethics-title">
        <div className="board wide">
          <h2 id="ethics-title">Privacy and security by design.</h2>
          <p className="general">{ETHICS.law}.</p>
          <ul className="ruled">
            {ETHICS.points.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="cite">3.0 Design and Prototype · Deployment Phase · Evaluation Design</p>
        </div>
      </section>

      {/* ================= 4.0 RESULTS AND DISCUSSION: the system ================= */}
      <section id="context" className="chapter" data-cam="context" data-snap aria-labelledby="context-title">
        <div className="board wide">
          <h2 id="context-title">One system, three outside parties.</h2>
          <p className="soft">Every change goes through the API; live updates reach both apps over Server-Sent Events.</p>
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
          <p className="cite">Level 0 Data Flow Diagram (Figure 3)</p>
        </div>
      </section>

      <section id="processes" className="chapter right" data-cam="processes" data-snap aria-labelledby="processes-title">
        <div className="board wide">
          <h2 id="processes-title">Seven processes inside PARADA.</h2>
          <table className="ledger wrap">
            <tbody>
              {PROCESSES.map(([n, name, what]) => (
                <tr key={n}>
                  <th scope="row">
                    <span className="num stamp-num">{n}</span> {name}
                  </th>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cite">Level 1 Data Flow Diagram, Parts 1 and 2 (Figures 4–5)</p>
        </div>
      </section>

      <section id="usecases" className="chapter" data-cam="usecases" data-snap aria-labelledby="usecases-title">
        <div className="board wide">
          <h2 id="usecases-title">Three actors, one system.</h2>
          <div className="split thirds">
            {USE_CASES.map((u) => (
              <div key={u.who}>
                <p className="label">{u.via}</p>
                <h3 className="actor">{u.who}</h3>
                <ul className="ruled tight">
                  {u.does.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="cite">Use Case Diagram (Figure 6)</p>
        </div>
      </section>

      <section id="architecture" className="chapter right" data-cam="arch" data-snap aria-labelledby="arch-title">
        <div className="board wide">
          <h2 id="arch-title">Five components, one authority.</h2>
          <p className="soft">
            Gate cameras send frames to the vision service, which sends only plate readings to the API as entry or exit
            events. The API applies authentication, roles and every parking rule, and is the only component that reads or
            writes the database; changes reach both apps after each commit.
          </p>
          <ol className="nodes" aria-label="Architecture components">
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
          <p className="cite">System Architecture (Figure 7) · 3.0 Tools and System Requirements</p>
        </div>
      </section>

      <section id="erd" className="chapter" data-cam="erd" data-snap aria-labelledby="erd-title">
        <div className="board wide">
          <h2 id="erd-title">Eighteen entities, the zone at the centre.</h2>
          <p className="soft">
            Slots, cameras, occupancy events and history, sessions, reservations, assignments, violations, fees and
            notifications all refer to a zone. A recommendation, an assignment, a reservation and a session are four
            records with separate life cycles. Camera frames and raw OCR output are not stored.
          </p>
          <ul className="chips" aria-label="Database entities">
            {ERD.entities.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="label rule-gap">Kept by the database itself</p>
          <ul className="ruled">
            {ERD.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="cite">Entity Relationship Diagram (Figure 8)</p>
        </div>
      </section>

      {/* ---------- the system at work: one car through Zone A ---------- */}
      <section id="how" aria-labelledby="how-title">
        <div className="how-head" data-cam="how" data-snap>
          <div className="board">
            <h2 id="how-title">How it answers the problem: one car, two gates.</h2>
            <p className="soft">Keep going: one car rides Zone A from the entry camera to the exit camera, through processes 3.0 and 4.0 of the Level 1 DFD.</p>
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

      {/* ================= 4.0 RESULTS AND DISCUSSION: the tests ================= */}
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
            Synthetic dataset: {RESULTS.dataset}. Live tests: {RESULTS.hardware}.
          </p>
          <p className="cite">4.0 Testing Results · Appendix A · {RESULTS.date}</p>
        </div>
      </section>

      <section id="tests" className="chapter" data-cam="tests" data-snap aria-labelledby="tests-title">
        <div className="board wide">
          <h2 id="tests-title">Functional and integration tests.</h2>
          <table className="ledger compact">
            <thead>
              <tr>
                <th scope="col">Workspace</th>
                <th scope="col">Suites</th>
                <th scope="col">Tests passed</th>
                <th scope="col">Skipped</th>
              </tr>
            </thead>
            <tbody>
              {TESTS.map(([w, suites, passed, skipped]) => (
                <tr key={w}>
                  <th scope="row">{w}</th>
                  <td className="num" data-label="Suites">{suites}</td>
                  <td className="num" data-label="Passed">{passed}</td>
                  <td className="num" data-label="Skipped">{skipped}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td />
                <td className="num" data-label="Passed">{TESTS.reduce((n, r) => n + Number(r[2]), 0).toLocaleString('en-US')}</td>
                <td className="num" data-label="Skipped">2</td>
              </tr>
            </tfoot>
          </table>
          <p className="soft">
            Latest full run 16 November 2026. In an earlier full run, type checking, linting and the production build passed
            in all workspaces (two lint warnings, no errors), and cross-service checks passed 31 of 31 against the API
            workflow and 17 of 17 against the admin production build. The two skipped vision tests are optional live tests
            that pass against a running backend.
          </p>
          <p className="cite">Table 1: Automated test results by workspace</p>
        </div>
      </section>

      <section id="accuracy" className="chapter right" data-cam="accuracy" data-snap aria-labelledby="accuracy-title">
        <div className="board wide">
          <h2 id="accuracy-title">Plate accuracy by condition.</h2>
          <table className="ledger compact">
            <thead>
              <tr>
                <th scope="col">Condition group</th>
                <th scope="col">Images</th>
                <th scope="col">Exact match</th>
              </tr>
            </thead>
            <tbody>
              {ACCURACY.rows.map(([c, n, v]) => (
                <tr key={c}>
                  <th scope="row">{c}</th>
                  <td className="num" data-label="Images">{n}</td>
                  <td className="num" data-label="Exact match">{v}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">{ACCURACY.total[0]}</th>
                <td className="num" data-label="Images">{ACCURACY.total[1]}</td>
                <td className="num" data-label="Exact match">{ACCURACY.total[2]}</td>
              </tr>
            </tfoot>
          </table>
          <p className="soft">{ACCURACY.outcomes} {ACCURACY.gain}</p>
          <p className="why">{ACCURACY.safety}</p>
          <p className="cite">Table 2: Exact-match plate accuracy by condition group · synthetic images, not production accuracy</p>
        </div>
      </section>

      <section id="live" className="chapter" data-cam="live" data-snap aria-labelledby="live-title">
        <div className="board wide">
          <h2 id="live-title">Live tests: two IP cameras, one real plate.</h2>
          <p className="soft">
            A researcher&rsquo;s own vehicle, plate <span className="num">{LIVE.plate}</span>, presented to the entry and exit cameras.
          </p>
          <table className="ledger compact wrap">
            <thead>
              <tr>
                <th scope="col">Round</th>
                <th scope="col">Version</th>
                <th scope="col">Correct plate recorded</th>
                <th scope="col">Incorrect</th>
              </tr>
            </thead>
            <tbody>
              {LIVE.rounds.map(([round, version, correct, wrong]) => (
                <tr key={round}>
                  <th scope="row">{round}</th>
                  <td data-label="Version">{version}</td>
                  <td className="num" data-label="Correct">{correct}</td>
                  <td className="num" data-label="Incorrect">{wrong}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="soft">{LIVE.revisions} {LIVE.missed}</p>
          <p className="why">{LIVE.lesson}</p>
          <p className="cite">Table 3: Live camera test rounds, in the order run · {RESULTS.hardware}</p>
        </div>
      </section>

      <section id="speed" className="chapter right" data-cam="speed" data-snap aria-labelledby="speed-title">
        <div className="board wide">
          <h2 id="speed-title">Responsiveness, stage by stage.</h2>
          <table className="ledger compact wrap">
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Median (ms)</th>
                <th scope="col">95th pct (ms)</th>
              </tr>
            </thead>
            <tbody>
              {SPEED.rows.map(([stage, med, p95]) => (
                <tr key={stage}>
                  <th scope="row">{stage}</th>
                  <td className="num" data-label="Median">{med}</td>
                  <td className="num" data-label="95th pct">{p95}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="ruled">
            <li>{SPEED.delivered}</li>
            <li>{SPEED.localhost}</li>
            <li>{SPEED.live}</li>
          </ul>
          <p className="cite">Table 4: Time per stage over 40 gate events</p>
        </div>
      </section>

      <section id="uat" className="chapter" data-cam="uat" data-snap aria-labelledby="uat-title">
        <div className="board wide">
          <h2 id="uat-title">What three users told us.</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Respondent</th>
                <th scope="col">Tried</th>
                <th scope="col">Tasks unaided</th>
                <th scope="col">Mean rating</th>
                <th scope="col">SUS</th>
              </tr>
            </thead>
            <tbody>
              {UAT.respondents.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.id} · {r.role}</th>
                  <td>{r.tried}</td>
                  <td className="num" data-label="Tasks unaided">{r.tasks}</td>
                  <td data-label="Mean rating"><span className="num">{r.mean}</span> {r.meaning}</td>
                  <td className="num" data-label="SUS">{r.sus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="soft">{UAT.finding}</p>
          <div className="split">
            <div>
              <p className="label">Fixed after the test</p>
              <ul className="ruled">
                {UAT.fixed.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Still open</p>
              <ul className="ruled">
                {UAT.remaining.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cite">User Acceptance Test, {UAT.date} (Tables 5, 6, 8) · three respondents, descriptive only · {UAT.caveat}</p>
        </div>
      </section>

      <section id="quality" className="chapter right" data-cam="quality" data-snap aria-labelledby="quality-title">
        <div className="board wide">
          <h2 id="quality-title">How they rated it.</h2>
          <table className="ledger compact">
            <thead>
              <tr>
                <th scope="col">Characteristic</th>
                <th scope="col">D1 driver</th>
                <th scope="col">P1 PFMO</th>
                <th scope="col">M1 MISD</th>
              </tr>
            </thead>
            <tbody>
              {UAT.quality.map(([c, d1, p1, m1]) => (
                <tr key={c}>
                  <th scope="row">{c}</th>
                  <td className="num" data-label="D1">{d1}</td>
                  <td className="num" data-label="P1">{p1}</td>
                  <td className="num" data-label="M1">{m1}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cite">{UAT.scale}</p>
          <div className="split">
            <div>
              <p className="label">What they liked</p>
              <ul className="ruled quotes">
                {UAT.comments.filter((c) => !c.improve).map((c) => (
                  <li key={c.said}>
                    <q>{c.said}</q> <span className="num">{c.who}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">What to improve</p>
              <ul className="ruled quotes">
                {UAT.comments.filter((c) => c.improve).map((c) => (
                  <li key={c.said}>
                    <q>{c.said}</q> <span className="num">{c.who}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cite">Table 7: Mean rating by quality characteristic (ISO/IEC 25010) · Appendix C.4, quoted as written</p>
        </div>
      </section>

      <section id="limits" className="chapter" data-cam="limits" data-snap aria-labelledby="limits-title">
        <div className="board wide">
          <h2 id="limits-title">Where it breaks, and what isn&rsquo;t proven yet.</h2>
          <div className="split">
            <div>
              <p className="label">Testing</p>
              <ul className="ruled">
                {LIMITS.testing.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Scope and users</p>
              <ul className="ruled">
                {LIMITS.scope.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cite">4.0 Discussion: Limitations · Compared with Sensor-Based Systems</p>
        </div>
      </section>

      {/* ================= 5.0 CONCLUSIONS AND RECOMMENDATIONS ================= */}
      <section id="conclusion" className="chapter right" data-cam="conclusion" data-snap aria-labelledby="conclusion-title">
        <div className="board wide">
          <h2 id="conclusion-title">Conclusions.</h2>
          <table className="ledger wrap verdicts">
            <tbody>
              {CONCLUSIONS.map((c) => (
                <tr key={c.obj}>
                  <th scope="row">
                    <span className="num stamp-num">{c.obj}</span> {c.what}
                    <small>{c.verdict}</small>
                  </th>
                  <td>{c.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="general">{OVERALL}</p>
          <p className="cite">5.0 Conclusions, one per objective</p>
        </div>
      </section>

      <section id="recommend" className="chapter" data-cam="recommend" data-snap aria-labelledby="recommend-title">
        <div className="board wide">
          <h2 id="recommend-title">Recommendations.</h2>
          <ol className="ruled counted recs">
            {RECOMMENDATIONS.map((r) => (
              <li key={r.title}>
                <p>
                  <b>{r.title}.</b> {r.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="cite">5.0 Recommendations · from the researchers&rsquo; live-test observations and the three respondents&rsquo; comments; three respondents are too few to count as end-user feedback</p>
        </div>
      </section>

      <section id="play" className="chapter right" data-cam="play" data-snap aria-labelledby="play-title">
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
          <p className="byline">Adviser: {THESIS.adviser}</p>
          <p className="soft">
            PARADA is a demonstration prototype, tested with two IP cameras and a real vehicle in a controlled setting.
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
