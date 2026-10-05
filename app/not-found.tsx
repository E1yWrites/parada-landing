import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="intro lost" aria-labelledby="lost-title">
      <div className="intro-mascot" aria-hidden="true">
        <img src="/brand/mascot-ears.webp" alt="" width={320} height={313} />
      </div>
      <div className="intro-copy">
        <h1 id="lost-title">No such zone.</h1>
        <p className="headline">This page isn&rsquo;t on the map (error 404).</p>
        <p>The address may be mistyped, or the page has moved. Every page is one tap from here:</p>
        <div className="actions">
          <Link className="btn primary" href="/">
            Back to PARADA
          </Link>
          <Link className="btn" href="/technical/">
            Technical
          </Link>
          <Link className="btn" href="/docs/">
            Docs
          </Link>
          <Link className="btn" href="/legal/">
            Legal
          </Link>
        </div>
      </div>
    </section>
  );
}
