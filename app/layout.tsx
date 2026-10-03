import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import Link from 'next/link';
import Nav from '@/components/Nav';
import SoundToggle from '@/components/SoundToggle';
import Experience from '@/components/Experience';
import { DESCRIPTION, EMAIL, GITHUB_URL, SITE_URL } from '@/lib/content';
import './globals.css';

const display = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

const TITLE = 'PARADA — Smart Parking Management System';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · PARADA' },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', title: TITLE, description: DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: '#0B0F15', colorScheme: 'dark' };

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
        <Experience />
        <header className="site-header">
          <Link href="/" className="brand" aria-label="PARADA home">
            <span className="brand-mark" aria-hidden="true">P</span>PARADA
          </Link>
          <Nav />
          <SoundToggle />
          <a className="header-link" href={GITHUB_URL} rel="noopener">GitHub</a>
        </header>
        <main id="content">{children}</main>
        <footer className="site-footer">
          <div>
            <p className="brand">PARADA</p>
            <p>Smart Parking System · A Capstone Project</p>
            <p>Lyceum of the Philippines University — Batangas</p>
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
