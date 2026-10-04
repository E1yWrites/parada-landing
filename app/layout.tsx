import type { Metadata, Viewport } from 'next';
import { Sofia_Sans, Sofia_Sans_Extra_Condensed, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import Nav from '@/components/Nav';
import SoundToggle from '@/components/SoundToggle';
import Experience from '@/components/Experience';
import LightBar from '@/components/LightBar';
import DriveHUD from '@/components/DriveHUD';
import Guilloche from '@/components/Guilloche';
import { DESCRIPTION, EMAIL, GITHUB_URL, SITE_URL } from '@/lib/content';
import './globals.css';

// Pass and form lettering: condensed caps (Sofia Sans Extra Condensed), the form's reading text (Sofia Sans),
// plates, counts and durations (JetBrains Mono).
const display = Sofia_Sans_Extra_Condensed({ subsets: ['latin'], weight: ['800', '900'], variable: '--font-display' });
const sans = Sofia_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' });

const TITLE = 'PARADA — Smart Parking Management System';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · PARADA' },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', title: TITLE, description: DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: '#1d4e9e', colorScheme: 'light' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PARADA',
  applicationCategory: 'Parking Management System',
  operatingSystem: 'Web, Android, iOS',
  description: DESCRIPTION,
  url: `${SITE_URL}/`,
  author: { '@type': 'Organization', name: 'Lyceum of the Philippines University — Batangas' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#content">Skip to content</a>
        <Guilloche />
        <Experience />
        <header className="site-header">
          <Link href="/" className="brand" aria-label="PARADA home">
            <span className="brand-mark" aria-hidden="true">P</span>PARADA
          </Link>
          <Nav />
          <SoundToggle />
          <a className="header-link" href={GITHUB_URL} rel="noopener">GitHub</a>
          <LightBar />
        </header>
        <DriveHUD />
        <main id="content">{children}</main>
        <footer className="site-footer">
          <div>
            <p className="brand">PARADA</p>
            <p>Smart parking system · a BSIT capstone project</p>
            <p>Lyceum of the Philippines University — Batangas</p>
            <p className="credit">
              Campus map data ©{' '}
              <a href="https://www.openstreetmap.org/copyright" rel="noopener">
                OpenStreetMap contributors
              </a>
              ; building outlines traced from satellite imagery. Cars from the{' '}
              <a href="https://kenney.nl/assets/car-kit" rel="noopener">Kenney Car Kit</a> (CC0).
            </p>
          </div>
          <nav aria-label="Footer">
            <Link href="/">Experience</Link>
            <Link href="/technical/">Technical</Link>
            <a href={GITHUB_URL} rel="noopener">GitHub</a>
            <a href={`mailto:${EMAIL}`}>Email</a>
          </nav>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
