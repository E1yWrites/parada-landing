import type { Metadata } from 'next';
import DocPage, { type Section } from '@/components/DocPage';
import { EMAIL } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'What the PARADA project site keeps, and what the PARADA parking system processes when an establishment runs it.',
  alternates: { canonical: '/legal/privacy/' },
};

const sections: Section[] = [
  {
    id: 'site',
    title: 'This website',
    body: (
      <>
        <p>
          The site has no accounts, forms, analytics or advertising, and sets no cookies. Fonts are served from the site
          itself. The one thing it stores is your sound on/off choice, in your own browser&rsquo;s local storage; clear
          your site data to remove it. Drive mode runs entirely in your browser and sends nothing anywhere.
        </p>
        <p>
          Like any website, the host that serves these pages (Vercel) processes standard request data such as your IP
          address and browser details to deliver them, under its own privacy policy. Links to GitHub take you to a site
          with its own terms.
        </p>
      </>
    ),
  },
  {
    id: 'system',
    title: 'The PARADA system',
    body: (
      <p>
        PARADA is not yet deployed: no establishment runs it today, so it holds no one&rsquo;s data. When an
        establishment does run it, that establishment decides why and how parking data is processed and is responsible
        for it, and must give drivers its own privacy notice. The rest of this page describes what the system is built
        to process, from its documentation, so that notice can be accurate.
      </p>
    ),
    sources: ['docs/architecture/roadmap.md', 'docs/how-to/deploy.md'],
  },
  {
    id: 'data',
    title: 'What the system processes',
    body: (
      <table className="spec">
        <tbody>
          {[
            ['Driver accounts', 'Name, optional username and phone, email, a password stored only as an argon2id hash, an optional profile picture (up to 2 MB), and verification codes stored only as a keyed hash.'],
            ['Vehicles', 'Licence plate (the key the cameras match), type, and optional make, model and colour.'],
            ['Gate events', 'For each car a gate camera reads: the plate as read, its normalised form, the OCR confidence, the camera, zone and time. Events are kept for unregistered plates too, so counts stay right and anomalies can be reviewed.'],
            ['Parking records', 'Sessions (entry, exit, duration), fees, reservations, zone assignments, violations and appeals, and notifications.'],
            ['Location', 'Only when you tap Navigate in the driver app: a one-off reading on your phone, with your permission, handed to your maps app. No background tracking, and it is not stored.'],
            ['Camera images', 'Frames are processed in memory by the vision service and are not saved or uploaded. In the recommended deployment, cameras and raw frames never leave the facility.'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    sources: ['docs/database/model.md', 'docs/api/README.md', 'docs/mobile/README.md', 'docs/vision/architecture.md', 'docs/how-to/deploy.md'],
  },
  {
    id: 'security',
    title: 'How it is protected',
    body: (
      <ul className="check">
        <li>Every request is checked against the signed-in user; drivers only ever see their own vehicles and records, and admin actions need the admin role.</li>
        <li>Sign-in tokens are kept in the phone&rsquo;s secure storage, or an HttpOnly cookie for the admin app, and can be revoked on the server.</li>
        <li>Cameras must present an API key; repeated or malformed events are rejected and rate-limited.</li>
        <li>Recovery emails are generic, and reset tokens are single-use, expiring and stored hashed.</li>
      </ul>
    ),
    sources: ['docs/security/phase15-threat-model.md'],
  },
  {
    id: 'retention',
    title: 'How long it is kept',
    body: (
      <>
        <p>
          Records are built to be kept as history: an unregistered vehicle is marked inactive rather than deleted, and
          zones are deactivated rather than removed, so past sessions and reports stay intact. You can remove your
          profile picture and change your email or phone at any time.
        </p>
        <p className="soft">
          Retention periods, production log redaction and the policy on raw camera images are listed in the project&rsquo;s
          threat model as open items to settle before deployment. The establishment running PARADA sets them.
        </p>
      </>
    ),
    sources: ['docs/api/README.md', 'docs/database/model.md', 'docs/security/phase15-threat-model.md'],
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: (
      <p>
        In the Philippines, the Data Privacy Act of 2012 (Republic Act No. 10173) gives you the right to be informed,
        to access, to object, to correct, to have data erased or blocked, to data portability, and to complain to the
        National Privacy Commission. For a deployed PARADA, exercise them with the establishment that runs it. For this
        site or the project, write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <DocPage
      title="Privacy notice."
      lead="This site keeps almost nothing. The PARADA system is built to process what a gate camera and a parking session need, and no more."
      updated="5 October 2026"
      sections={sections}
    />
  );
}
