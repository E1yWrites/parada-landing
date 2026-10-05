import type { Metadata } from 'next';
import DocPage, { type Section } from '@/components/DocPage';

export const metadata: Metadata = {
  title: 'Licences and credits',
  description: 'Map data, 3D models, fonts, brand assets and libraries used on the PARADA project site, and their licences.',
  alternates: { canonical: '/legal/licenses/' },
};

const row = (what: string, who: React.ReactNode, licence: React.ReactNode) => (
  <tr key={what}>
    <th scope="row">{what}</th>
    <td>{who}</td>
    <td>{licence}</td>
  </tr>
);
const a = (href: string, text: string) => (
  <a href={href} rel="noopener">
    {text}
  </a>
);

const sections: Section[] = [
  {
    id: 'map',
    title: 'Map and campus',
    body: (
      <>
        <table className="spec">
          <thead>
            <tr>
              <th scope="col">Used for</th>
              <th scope="col">Source</th>
              <th scope="col">Licence</th>
            </tr>
          </thead>
          <tbody>
            {row('Campus edge, streets, neighbourhood houses', <>Map data © {a('https://www.openstreetmap.org/copyright', 'OpenStreetMap contributors')}</>, a('https://opendatacommons.org/licenses/odbl/', 'ODbL 1.0'))}
            {row('Campus building outlines', 'Traced by the team from satellite imagery for reference; the imagery itself is not published here', '—')}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'assets',
    title: 'Models, fonts and brand',
    body: (
      <table className="spec">
        <thead>
          <tr>
            <th scope="col">Used for</th>
            <th scope="col">Source</th>
            <th scope="col">Licence</th>
          </tr>
        </thead>
        <tbody>
          {row('Cars in the 3D campus', a('https://kenney.nl/assets/car-kit', 'Kenney Car Kit'), a('https://creativecommons.org/publicdomain/zero/1.0/', 'CC0 1.0'))}
          {row('Buildings, trees, houses, streets', 'Modelled in code for this site', '—')}
          {row('Sofia Sans, Sofia Sans Extra Condensed', 'Lettersoup', a('https://openfontlicense.org', 'SIL OFL 1.1'))}
          {row('JetBrains Mono', 'JetBrains', a('https://openfontlicense.org', 'SIL OFL 1.1'))}
          {row('Space Grotesk, Inter (app screens)', 'Florian Karsten; Rasmus Andersson', a('https://openfontlicense.org', 'SIL OFL 1.1'))}
          {row('PARADA logo, mark and mascot', 'The PARADA project team (from the app repository)', 'All rights reserved')}
        </tbody>
      </table>
    ),
    sources: ['apps/admin/public/brand', 'apps/mobile/assets/lottie'],
  },
  {
    id: 'code',
    title: 'Libraries',
    body: (
      <table className="spec">
        <thead>
          <tr>
            <th scope="col">Library</th>
            <th scope="col">Licence</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Next.js, React, React DOM', 'MIT'],
            ['three.js, React Three Fiber, drei', 'MIT'],
            ['GSAP, @gsap/react', "GreenSock Standard 'No Charge' License"],
            ['@vercel/analytics', 'MIT'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
];

export default function Licenses() {
  return <DocPage title="Licences and credits." lead="What this site is built from, who made it, and the terms it is used under." updated="5 October 2026" sections={sections} />;
}
