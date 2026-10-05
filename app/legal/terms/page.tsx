import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage, { type Section } from '@/components/DocPage';
import { EMAIL, GITHUB_URL } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms of use for the PARADA project site: a BSIT capstone prototype, its demo content, ownership and limits.',
  alternates: { canonical: '/legal/terms/' },
};

const sections: Section[] = [
  {
    id: 'site',
    title: 'This site',
    body: (
      <p>
        This website presents PARADA, a smart parking management system built as a BS Information Technology capstone
        at Lyceum of the Philippines University — Batangas. It is a project site, not a service: there are no accounts,
        no bookings and no payments here, and using it does not create any agreement to provide parking.
      </p>
    ),
  },
  {
    id: 'demo',
    title: 'Demo content',
    body: (
      <>
        <p>
          Zone figures, plates, sessions and receipts on this site are demonstration data. The 3D campus is a model of
          LPU-Batangas for explanation only, and drive mode simulates PARADA&rsquo;s zone-gate rules in your browser.
          None of it shows live parking at LPU-Batangas or anywhere else.
        </p>
        <p>
          The PARADA system is still in development: its deployment phase is pending (see{' '}
          <Link href="/docs/#deploy">Documentation</Link>). An establishment that runs it would set its own rules —
          guest admission, fees and violation policies are establishment configuration — and its own terms for drivers.
        </p>
      </>
    ),
    sources: ['docs/architecture/roadmap.md', 'docs/database/model.md'],
  },
  {
    id: 'ownership',
    title: 'Who owns what',
    body: (
      <>
        <p>
          The PARADA name, logo, mascot and the source code in the{' '}
          <a href={GITHUB_URL} rel="noopener">
            project repository
          </a>{' '}
          belong to the PARADA project team. The repository does not publish an open-source licence, so no right to copy,
          modify or redistribute the code is granted beyond what the law allows or the team grants in writing.
        </p>
        <p>
          Map data, 3D models, fonts and libraries used on this site belong to their owners and are used under their own
          licences, listed on <Link href="/legal/licenses/">Licences and credits</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'Using this site',
    body: (
      <p>
        Please don&rsquo;t try to disrupt the site, probe it for weaknesses without permission, or present its demo
        figures as real data. If you find a security problem in PARADA itself, tell the team by email rather than
        disclosing it publicly.
      </p>
    ),
  },
  {
    id: 'limits',
    title: 'No warranty',
    body: (
      <p>
        The site and its content are provided as they are, for information about a student project. To the extent the
        law allows, the team gives no warranty that they are complete, accurate or always available, and is not liable
        for losses from relying on them.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <p>
        These terms may change as the project does; the date above shows the latest version. Questions:{' '}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    ),
  },
];

export default function Terms() {
  return <DocPage title="Terms of use." lead="The short version: a student project site, demo data, no service, no warranty." updated="5 October 2026" sections={sections} />;
}
