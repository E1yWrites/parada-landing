import type { Metadata } from 'next';
import DocPage, { type Section } from '@/components/DocPage';
import { EMAIL } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'What the PARADA project site keeps, and what the PARADA parking system processes when an establishment runs it.',
  alternates: { canonical: '/legal/privacy/' },
};

const sections: Section[] = [
  {
    id: 'site',
    title: 'This website',
    body: (
      <>
        <p>
          The site has no accounts, forms, analytics or advertising, sets no cookies, and makes no requests to other
          servers: fonts, models and code are all served from the site itself. If you switch the sound on or off, that
          choice is saved in your own browser&rsquo;s local storage; clear your site data to remove it. Drive mode runs
          entirely in your browser and sends nothing anywhere.
        </p>
        <p>
          Like any website, the host that serves these pages (Vercel) processes standard request data such as your IP
          address and browser details to deliver them, under its own privacy policy, and may do so outside the
          Philippines. If you email the team, we see your email address and message and use them only to reply. Links to
          GitHub take you to a site with its own terms.
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
    id: 'purpose',
    title: 'Why it is processed',
    body: (
      <ul className="check">
        <li>To count cars in and out at each zone&rsquo;s gate cameras and show live availability.</li>
        <li>To open and close parking sessions and calculate fees where the establishment sets them.</li>
        <li>To run reservations, zone assignments, guest admission, violations and appeals.</li>
        <li>To run your account: sign-in, verification, password recovery and notifications.</li>
        <li>
          To keep the counts honest: mismatches such as an unknown plate or an exit with no session are recorded for an
          administrator to review.
        </li>
      </ul>
    ),
    sources: ['README.md', 'docs/database/model.md'],
  },
  {
    id: 'data',
    title: 'What the system processes',
    body: (
      <>
        <p>
          A plate number can identify the person who drives or owns the car, so plates and every record tied to them are
          personal information, the same as account details.
        </p>
        <table className="spec">
          <tbody>
            {[
              [
                'Driver accounts',
                'Name, optional username and phone, email, a password stored only as an argon2id hash, an optional profile picture (up to 2 MB), and verification codes stored only as a keyed hash.',
              ],
              ['Vehicles', 'Licence plate (the key the cameras match), type, and optional make, model and colour.'],
              [
                'Gate events',
                'For each car a gate camera reads: the plate as read, its normalised form, the OCR confidence, the camera, zone and time. Events are kept for unregistered plates too, so counts stay right and anomalies can be reviewed.',
              ],
              [
                'Parking records',
                'Sessions (entry, exit, duration), fees, reservations, zone assignments, violations and appeals, and notifications.',
              ],
              [
                'Location',
                'Only when you tap Navigate in the driver app, and only with your permission: your phone reads its position once and passes it to Apple Maps or Google Maps as the start of the route, where that app\u2019s own privacy policy applies. PARADA does not send it to its servers, store it, or track you in the background.',
              ],
              [
                'Camera images',
                'Frames are processed in memory by the vision service and are not saved or uploaded. In the recommended deployment, cameras and raw frames never leave the facility.',
              ],
            ].map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
    sources: [
      'docs/database/model.md',
      'docs/api/README.md',
      'docs/mobile/README.md',
      'docs/vision/architecture.md',
      'docs/how-to/deploy.md',
    ],
  },
  {
    id: 'sharing',
    title: 'Who can see it',
    body: (
      <ul className="check">
        <li>You see your own account, vehicles, sessions, reservations and notifications, and no one else&rsquo;s.</li>
        <li>
          The establishment&rsquo;s administrators see the records needed to run the facility: zones, sessions, users
          and their vehicles, violations and anomalies. They never see passwords.
        </li>
        <li>
          The services the establishment uses to run PARADA process data on its behalf: its hosting, and the email
          provider that sends verification and reset emails.
        </li>
        <li>
          Payments are not enabled in the documented system. If an establishment adds a payment provider, its own notice
          must name it.
        </li>
      </ul>
    ),
    sources: ['docs/api/README.md', 'docs/how-to/deploy.md', 'docs/security/phase15-threat-model.md'],
  },
  {
    id: 'security',
    title: 'How it is protected',
    body: (
      <ul className="check">
        <li>
          Every request is checked against the signed-in user; drivers only ever see their own vehicles and records, and
          admin actions need the admin role.
        </li>
        <li>
          Sign-in tokens are kept in the phone&rsquo;s secure storage, or an HttpOnly cookie for the admin app, and can
          be revoked on the server.
        </li>
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
          profile picture and change your email or phone at any time. The documented system has no self-service way to
          delete an account; ask the establishment that runs it.
        </p>
        <p className="soft">
          Retention periods, production log redaction and the policy on raw camera images are listed in the
          project&rsquo;s threat model as open items to settle before deployment. The establishment running PARADA sets
          them.
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
        In the Philippines, the Data Privacy Act of 2012 (Republic Act No. 10173) gives you the right to be informed, to
        access, to object, to correct, to have data erased or blocked, to data portability, to be compensated for damage
        from inaccurate or unlawfully used data, and to complain to the{' '}
        <a href="https://privacy.gov.ph" rel="noopener">
          National Privacy Commission
        </a>
        . For a deployed PARADA, exercise them with the establishment that runs it. For this site or the project, write
        to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
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
