import Link from 'next/link';
import { PAINS, MOBILE_STEPS, ADMIN_VERBS, PROOF, TEAM, EMAIL } from '@/lib/content';
import AppScreens from '@/components/AppScreens';
import CopyEmail from '@/components/CopyEmail';
import GateSim from '@/components/GateSim';
import HeroPins from '@/components/HeroPins';
import Morning from '@/components/Morning';

// The landing page, for the people who would bring PARADA to their campus: what it does, how, what each side gets,
// what was proven, and how to start a pilot. No WebGL here (the 3D campus lives on /demo), but the page is run, not
// read: pins on the campus still, a Today / With PARADA switch, and Zone A's gates as a simulation.
const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent('PARADA pilot')}`;

export default function Home() {
  return (
    <div className="land">
      <section className="land-hero" aria-labelledby="hero-title">
        <div className="land-shot">
          <div className="shot-frame">
            <picture>
              <source media="(max-width: 768px)" srcSet="/campus/hero-tall.webp" width={900} height={760} />
              <img src="/campus/hero-wide.webp" alt="The LPU-Batangas campus in 3D: the main gate canopy, the tree-lined parking avenue and the loop round the JPL Building." width={1920} height={1080} fetchPriority="high" />
            </picture>
            <HeroPins />
          </div>
        </div>
        <div className="board">
          <div className="pass-band">
            <span className="brand-mark" aria-hidden="true">
              <img src="/brand/mark.webp" alt="" width={160} height={160} />
            </span>
            Smart parking pass
            <span className="slot" aria-hidden="true" />
            <span className="num">LPU-B</span>
          </div>
          <p className="wordmark">
            <img src="/brand/logo.webp" alt="PARADA" width={900} height={119} />
          </p>
          <h1 id="hero-title">Guiding every vehicle to its zone.</h1>
          <p className="headline">
            Cameras at the gates of each parking area count every car in and out. Drivers see where there&rsquo;s room
            before they arrive. Your office sees every area, live.
          </p>
          <div className="actions">
            <a className="btn primary" href="#contact">Talk to the team</a>
            <Link className="btn" href="/demo/">
              See it drive
            </Link>
          </div>
          <p className="fine">Built and tested at {TEAM.school}</p>
        </div>
      </section>

      <section className="land-band paper" aria-labelledby="problem-title">
        <div className="land-wrap split-2">
          <div>
            <h2 id="problem-title">The lot fills up. Nobody sees it coming.</h2>
            <ul className="pains">
              {PAINS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="soft measure">
              Putting a sensor in every space fixes that, but you have to buy, install and maintain hundreds of devices.
              PARADA counts at the gates instead, so the hardware grows with your entrances, not your spaces.
            </p>
          </div>
          <Morning />
        </div>
      </section>

      <section className="land-band mint" aria-labelledby="how-title">
        <div className="land-wrap">
          <h2 id="how-title">Three stops. No sensor in any space.</h2>
          <p className="headline measure">Try it: send a car through Zone A&rsquo;s gates, then tap it to drive it out.</p>
          <GateSim />
        </div>
      </section>

      <section className="land-band paper" aria-labelledby="sides-title">
        <div className="land-wrap">
          <h2 id="sides-title">One system, two screens.</h2>
          <div className="sides">
            <div className="side">
              <AppScreens part="driver" />
              <div>
                <h3>For drivers: the PARADA app</h3>
                <dl className="who">
                  {MOBILE_STEPS.map((s) => (
                    <div key={s.title}>
                      <dt>{s.title}</dt>
                      <dd>{s.body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="side">
              <AppScreens part="admin" />
              <div>
                <h3>For your office: the dashboard</h3>
                <dl className="who">
                  {ADMIN_VERBS.map((v) => (
                    <div key={v.title}>
                      <dt>{v.title}</dt>
                      <dd>{v.body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
          <p className="fine">Screens drawn from the PARADA apps, showing demo figures.</p>
        </div>
      </section>

      <section className="land-band mint" aria-labelledby="proof-title">
        <div className="land-wrap">
          <h2 id="proof-title">Tested, and ready to pilot.</h2>
          <p className="headline measure">
            PARADA works end to end: cameras, plate reading, the driver app and the office dashboard. It has been tested
            in a controlled setting and hasn&rsquo;t been installed at a parking site yet. That&rsquo;s the next step.
          </p>
          <dl className="proof">
            {PROOF.map((p) => (
              <div key={p.label} className="field">
                <dt>{p.label}</dt>
                <dd className="num">{p.value}</dd>
                <small>{p.note}</small>
              </div>
            ))}
          </dl>
          <p className="soft measure">
            Private by design: camera video is read in memory and never stored. Only the plate reading, the camera and
            the time reach PARADA&rsquo;s server.
          </p>
        </div>
      </section>

      <section id="contact" className="land-band contact" aria-labelledby="contact-title">
        <div className="land-wrap">
          <div className="board wide">
            <h2 id="contact-title">Interested in PARADA for your campus? Talk to the team.</h2>
            <p>
              We&rsquo;re looking for a first site to pilot PARADA. Tell us a little about yours: how many parking areas
              and gates you have, and roughly how many spaces.
            </p>
            <div className="actions">
              <a className="btn primary" href={MAIL}>Email the team</a>
              <Link className="btn" href="/demo/">
                See it drive
              </Link>
            </div>
            <CopyEmail email={EMAIL} />
            <p className="fine">
              Built by {TEAM.names.join(', ')}. {TEAM.program}, {TEAM.school}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
