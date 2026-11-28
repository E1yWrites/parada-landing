import type { Metadata } from 'next';
import Link from 'next/link';
import { PIPELINE, EMAIL } from '@/lib/content';
import LoadStatus from '@/components/LoadStatus';
import SnapPop from '@/components/SnapPop';
import AppScreens from '@/components/AppScreens';
import Tally from '@/components/Tally';
import { DriveIn, DriveSetup, PassFields } from '@/components/DriveIn';

export const metadata: Metadata = {
  title: 'See it drive',
  description: 'Follow one car through PARADA on a 3D model of the LPU-Batangas campus, from the entrance camera to the exit receipt, or take the wheel yourself.',
  alternates: { canonical: '/demo/' },
};

// The 3D campus: one car through Zone A's two gates, nine stops, then the wheel is yours. One stop per page turn.
export default function Demo() {
  return (
    <>
      <SnapPop />
      <section className="chapter hero" data-cam="hero" data-snap aria-labelledby="demo-title">
        <div className="board">
          <div className="pass-band">
            <span className="brand-mark" aria-hidden="true">
              <img src="/brand/mark.webp" alt="" width={160} height={160} />
            </span>
            Smart parking pass
            <span className="slot" aria-hidden="true" />
            <span className="num">LPU-B</span>
          </div>
          <h1 id="demo-title" className="h2">Take one car through the gates.</h1>
          <p>
            This is the LPU-Batangas campus, modelled from satellite imagery. Watch one car drive in, park and leave,
            or take the wheel yourself.
          </p>
          <PassFields />
          <div className="actions">
            <DriveIn />
            <a className="btn" href="#how">Watch the trip</a>
          </div>
          <Tally />
          <LoadStatus />
          <p className="fine">Demo figures</p>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title">
        <div className="how-head" data-cam="how" data-snap>
          <div className="board">
            <h2 id="how-title">One car, two gates.</h2>
            <p className="soft">Keep scrolling. The car drives up to Zone A&rsquo;s entrance camera, parks, and leaves through the exit camera at the north gate.</p>
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
              </div>
              {s.id === 'clients' && <AppScreens />}
            </li>
          ))}
        </ol>
      </section>

      <section id="play" className="chapter right" data-cam="play" data-snap aria-labelledby="play-title">
        <div className="board">
          <h2 id="play-title">Your turn: drive it.</h2>
          <p className="needs-webgl">
            Pull up under the entry canopy, let the camera read your plate and watch Zone A&rsquo;s count go up. Leave
            through the north gate to get your receipt. Try the guest plate too: if your site only lets guests use Zone
            C, Zone A turns them away.
          </p>
          <p className="no-webgl">
            Driving needs WebGL, which this browser has turned off. The trip above walks through the same stops.
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

      <section className="chapter" data-cam="contact" data-snap aria-labelledby="next-title">
        <div className="board">
          <h2 id="next-title">Want this at your gates?</h2>
          <p>
            PARADA is a tested prototype, and the team is ready to pilot it at a real parking site. Tell us how many
            parking areas and gates you have.
          </p>
          <div className="actions">
            <a className="btn primary" href={`mailto:${EMAIL}?subject=${encodeURIComponent('PARADA pilot')}`}>Email the team</a>
            <Link className="btn" href="/">About PARADA</Link>
          </div>
          <p className="fine num">{EMAIL}</p>
        </div>
      </section>
    </>
  );
}
