import type { Metadata } from 'next';
import Link from 'next/link';
import { EMAIL } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Terms of use, privacy notice, and licences and credits for the PARADA project site and system.',
  alternates: { canonical: '/legal/' },
};

const PAGES = [
  { href: '/legal/terms/', title: 'Terms of use', body: 'What this site is, what its demo content means, who owns what, and the limits of what we promise.' },
  { href: '/legal/privacy/', title: 'Privacy notice', body: 'What this site keeps (almost nothing), and what the PARADA system processes when an establishment runs it.' },
  { href: '/legal/licenses/', title: 'Licences and credits', body: 'Map data, 3D models, fonts and libraries used here, under their own licences.' },
];

export default function Legal() {
  return (
    <div className="doc" data-cam="tech">
      <header>
        <h1>Legal.</h1>
        <p className="lead">
          PARADA is a BSIT capstone project at Lyceum of the Philippines University — Batangas, in development and not
          yet deployed. These pages describe this website and the system as its repository documents it.
        </p>
      </header>
      <section aria-label="Legal pages">
        <div className="cards">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} className="card card-link">
              <h2>{p.title}</h2>
              <p>{p.body}</p>
            </Link>
          ))}
        </div>
        <p className="soft" style={{ marginTop: '1.5rem' }}>
          Questions about any of these: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      </section>
    </div>
  );
}
