import type { Metadata } from 'next';
import { ARCHITECTURE, FEATURES, CONFIG, STACK, SECURITY, STATUS, JOURNEY, HIGHLIGHTS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Technical overview',
  description: 'PARADA architecture, features, configuration, technology stack, security model, and current build status.',
  alternates: { canonical: '/technical/' },
};

const TOC = [
  ['objective', 'Objective'],
  ['architecture', 'Architecture'],
  ['features', 'Features'],
  ['config', 'Configuration'],
  ['stack', 'Stack'],
  ['security', 'Security'],
  ['status', 'Status'],
  ['journey', 'Journey'],
  ['capstone', 'Capstone'],
];

export default function Technical() {
  return (
    <div className="doc" data-cam="tech">
      <header>
        <span className="eyebrow">Technical overview</span>
        <h1 style={{ fontSize: 'var(--step-3)' }}>How PARADA is built, and where the build stands.</h1>
        <p className="lead muted">Architecture, modules, stack, security, and status, all on one page.</p>
        <nav className="toc" aria-label="On this page">
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
      </header>

      <section id="objective" aria-labelledby="objective-title">
        <h2 id="objective-title">Project objective</h2>
        <p>
          To develop a smart parking management system that combines computer vision, license-plate recognition,
          zone-based occupancy monitoring, parking operations, mobile navigation, and web-based administration into a
          unified platform.
        </p>
      </section>

      <section id="architecture" aria-labelledby="architecture-title">
        <h2 id="architecture-title">System architecture</h2>
        <p className="muted">
          A camera event travels through vision/OCR into the API, which resolves identity, occupancy and sessions,
          persists them, and propagates the new state to both clients. Vision reads → API decides → DB persists →
          clients read.
        </p>
        <ol className="flow">
          {ARCHITECTURE.map((n) => (
            <li key={n.id}>
              <b>{n.name}</b>
              <span>{n.tech}</span>
            </li>
          ))}
        </ol>
        <div className="cards">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="card">
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" aria-labelledby="features-title">
        <h2 id="features-title">Features, grouped by system module.</h2>
        <p className="muted">
          A modular breakdown of platform capabilities — from driver experience to intelligent infrastructure and
          operational control.
        </p>
        <div className="cols">
          {FEATURES.map((f) => (
            <div key={f.module}>
              <h3>{f.module}</h3>
              <ul className="check">
                {f.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="config" aria-labelledby="config-title">
        <h2 id="config-title">PARADA is configurable.</h2>
        <div className="cards">
          {CONFIG.map((c) => (
            <div key={c.group} className="card">
              <h3>{c.group}</h3>
              <p>{c.fields.join(' · ')}</p>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: '1rem' }}>
          This allows PARADA to adapt to different establishment layouts without changing the application&rsquo;s
          source code for every parking facility.
        </p>
      </section>

      <section id="stack" aria-labelledby="stack-title">
        <h2 id="stack-title">What it&rsquo;s built with.</h2>
        <div className="cards">
          {STACK.map((s) => (
            <div key={s.group} className="card">
              <h3>{s.group}</h3>
              <ul className="chips">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="security" aria-labelledby="security-title">
        <h2 id="security-title">Designed with security in mind.</h2>
        <div className="cards">
          {SECURITY.map((s) => (
            <div key={s.title} className="card">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="status" aria-labelledby="status-title">
        <h2 id="status-title">Where the build stands.</h2>
        <div className="cols">
          <div>
            <h3>Implemented</h3>
            <ul className="check">
              {STATUS.implemented.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Continuing / evaluation</h3>
            <ul className="check" style={{ '--c': 'var(--busy)' } as React.CSSProperties}>
              {STATUS.continuing.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="journey" aria-labelledby="journey-title">
        <h2 id="journey-title">Systematically engineered.</h2>
        <ol className="journey">
          {JOURNEY.map((j) => (
            <li key={j}>{j}</li>
          ))}
        </ol>
      </section>

      <section id="capstone" aria-labelledby="capstone-title">
        <h2 id="capstone-title">An academic project.</h2>
        <p>
          <b>Lyceum of the Philippines University — Batangas.</b> PARADA is developed as a capstone project for the
          Bachelor of Science in Information Technology program.
        </p>
        <h3>What PARADA currently demonstrates</h3>
        <p className="muted">
          PARADA demonstrates the integration of mobile development, web administration, backend services, database
          management, computer vision, OCR, GPS navigation, and configurable parking operations within a single system
          architecture.
        </p>
        <p className="muted">
          The system is developed as a capstone prototype and evaluated based on functionality, integration,
          correctness, and system behavior. Formal accuracy evaluation and production deployment are treated separately
          from the functional implementation.
        </p>
        <ul className="chips">
          {['Capstone project', 'Smart parking', 'Computer vision', 'OCR', 'Mobile applications', 'Web applications'].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
