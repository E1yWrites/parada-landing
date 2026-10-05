import type { Metadata } from 'next';
import DocPage, { type Section } from '@/components/DocPage';
import { GITHUB_URL } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'How the PARADA system is laid out, set up, run, tested, configured and deployed, summarised from the project repository.',
  alternates: { canonical: '/docs/' },
};

// Everything here is summarised from the PARADA repository (README.md and docs/); each section names its files.
const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <>
        <p>
          PARADA helps drivers find available parking and helps administrators monitor small-to-medium parking
          facilities (roughly 50–100 spaces across several zones). Instead of a sensor on every slot, it counts
          vehicles at zone gates with standard cameras and OCR, and keeps occupancy per zone.
        </p>
        <p>
          The authoritative figure is zone availability: <code>available = capacity − occupied</code>. Parking slots
          exist for layout and inventory only and are never derived from camera occupancy.
        </p>
      </>
    ),
    sources: ['README.md', 'docs/database/model.md'],
  },
  {
    id: 'structure',
    title: 'Repository layout',
    body: (
      <table className="spec">
        <tbody>
          {[
            ['apps/mobile', 'Driver app: React Native, Expo, TypeScript'],
            ['apps/admin', 'Admin dashboard: Next.js, TypeScript, Tailwind CSS'],
            ['services/api', 'Backend API: Node.js, Express, TypeScript'],
            ['services/vision', 'Vision/OCR service: Python, FastAPI, OpenCV, EasyOCR'],
            ['packages/database', 'Prisma schema, database access, embedded dev database'],
            ['packages/types · packages/config', 'Shared TypeScript types and configuration'],
            ['docs/', 'Architecture, database, API, mobile, vision, security and how-to guides'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th scope="row">
                <code>{k}</code>
              </th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    sources: ['README.md'],
  },
  {
    id: 'flow',
    title: 'How data flows',
    body: (
      <>
        <pre>
          {`Camera → Vision/OCR → API → Domain → Database
Mobile → API → Domain → Database
Admin  → Next.js proxy → API → Domain → Database
Realtime (SSE) → Admin + Mobile`}
        </pre>
        <p>
          The backend is the only authority on parking state. Vision only identifies what it sees and posts it over
          HTTP; it never touches the database. Neither client reaches the database directly; the admin app goes
          through a server-side proxy that keeps the session token in an HttpOnly cookie. Realtime updates are
          Server-Sent Events, published only after their transaction commits.
        </p>
      </>
    ),
    sources: ['README.md', 'docs/architecture/roadmap.md'],
  },
  {
    id: 'setup',
    title: 'Getting started',
    body: (
      <>
        <ul className="check">
          <li>Node.js 18+ and npm 9+.</li>
          <li>Python 3.11, only for the vision/OCR service.</li>
          <li>No PostgreSQL install and no Docker: the database package runs an embedded PostgreSQL 18 on port 5442.</li>
        </ul>
        <pre>{`npm install
# copy each package's .env.example to .env and fill in real values; never commit secrets
PARADA_SEED_ADMIN_PASSWORD=<strong-admin-password>
PARADA_SEED_USER_PASSWORD=<strong-user-password>
npm run setup -w @parada/vision   # vision virtualenv (optional)`}</pre>
        <p className="soft">The seed refuses to run without those two passwords outside the test environment.</p>
      </>
    ),
    sources: ['README.md', 'docs/how-to/setup.md', 'docs/how-to/run-and-test-locally.md'],
  },
  {
    id: 'run',
    title: 'Running it',
    body: (
      <>
        <pre>{`npm run dev         # database + API + admin + mobile
npm run dev:api     # API only
npm run dev:admin   # admin only
npm run dev:mobile  # mobile only (Expo LAN mode)
npm run db:start    # start the embedded database   (db:stop to stop it)
npm run dev -w @parada/vision      # vision service (FastAPI) — not started by npm run dev
npm run camera -w @parada/vision   # camera runtime: USB / RTSP / video file`}</pre>
        <table className="spec">
          <thead>
            <tr>
              <th scope="col">Service</th>
              <th scope="col">Port</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['API', '4100'],
              ['Admin web', '3000'],
              ['Vision/OCR', '8001'],
              ['Expo / Metro', '8082'],
              ['Embedded PostgreSQL', '5442'],
            ].map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td className="num">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="soft">On a phone, point <code>EXPO_PUBLIC_API_URL</code> at your machine&rsquo;s LAN address, not localhost.</p>
      </>
    ),
    sources: ['README.md'],
  },
  {
    id: 'testing',
    title: 'Testing',
    body: (
      <>
        <pre>{`npm run db:start
npm run db:test:setup -w @parada/database   # creates parada_test + parada_test_api
npm run test`}</pre>
        <p>
          API and database suites run against real PostgreSQL and refuse to start unless pointed at a test database.
          Measured in Phase 14: types 9, database 49, API 267, admin 79, mobile 324 tests passing; vision 73 passing
          with 2 opt-in live tests skipped.
        </p>
        <p className="soft">
          These are unit and integration results. No on-device or deployment testing is claimed. The OCR evaluation
          is a characterisation on a synthetic dataset (1,250 generated images), not a production accuracy claim.
        </p>
      </>
    ),
    sources: ['README.md', 'docs/vision/phase14-evaluation.md'],
  },
  {
    id: 'zone',
    title: 'Adding a zone',
    body: (
      <ol className="steps-list">
        <li>Sign in to the admin dashboard and open Zones.</li>
        <li>
          Choose New zone and fill in name, code (what drivers see at the gate), an optional description, capacity
          (the authoritative availability number), and optional navigation latitude/longitude. Directions stay off
          in the app until both are set.
        </li>
        <li>
          Submit. This calls <code>POST /admin/zones</code> and creates the zone as active. Zones are deactivated,
          never deleted, so their history is kept.
        </li>
      </ol>
    ),
    sources: ['docs/how-to/add-a-zone.md'],
  },
  {
    id: 'camera',
    title: 'Adding a camera',
    body: (
      <>
        <p>Two parts, both required:</p>
        <ol className="steps-list">
          <li>
            Register the logical camera in the admin dashboard (Cameras → Register camera): a permanent identifier
            such as <code>CAM-A01</code>, its zone, its gate direction (entry, exit or bidirectional) and status.
            Direction, zone and status are enforced by the backend on every event.
          </li>
          <li>
            Point a frame source at it in the vision service: a USB camera, an RTSP stream or a video file. The
            service reads a capped number of frames per second (2 by default) and posts plate events to the API.
          </li>
        </ol>
      </>
    ),
    sources: ['docs/how-to/add-a-camera.md', 'docs/vision/architecture.md'],
  },
  {
    id: 'api',
    title: 'API at a glance',
    body: (
      <table className="spec">
        <tbody>
          {[
            ['Auth', 'Register (email code), verify, log in (JWT), log out (server-side revocation), password reset, profile, email/phone change, avatar'],
            ['Driver', 'Zones and live occupancy, recommendation, zone assignments, reservations, sessions, vehicles — all scoped to the signed-in user'],
            ['Admin', 'Dashboard, zones, slots (layout only), cameras, sessions, users, vehicles, notifications, anomalies — admin role only'],
            ['Camera ingress', 'POST /zones/:zoneId/events with an X-API-Key; repeated source events are rejected'],
            ['Realtime', 'An authenticated Server-Sent Events stream, scoped per user and role'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    sources: ['docs/api/README.md'],
  },
  {
    id: 'deploy',
    title: 'Deployment',
    body: (
      <>
        <p>One application, three deployment profiles chosen by infrastructure and configuration alone:</p>
        <ul className="check">
          <li>Local: database, API, admin and vision on the facility network; cameras over RTSP on the LAN.</li>
          <li>Online: API, admin and database on remote hosts behind HTTPS.</li>
          <li>Hybrid (recommended for the capstone): online API, admin and database, with vision on the facility network posting over HTTPS. Cameras and raw frames never leave the site.</li>
        </ul>
        <p className="soft">
          Status: Phase 15 (Deployment) is pending. Every profile is deployable and its build, migration and start-up
          path is verified on Linux, but no production deployment has been made.
        </p>
      </>
    ),
    sources: ['docs/how-to/deploy.md', 'docs/architecture/roadmap.md'],
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    body: (
      <p>
        Phases 0–14 are complete: requirements and architecture, infrastructure, database, backend, authentication,
        vision integration, guest admission, reservations and assignment, the admin and mobile apps, real OCR,
        camera provisioning, realtime, full integration, and testing with the accuracy evaluation. Phase 15
        (Deployment) and Phase 16 (Documentation and final review) are next.
      </p>
    ),
    sources: ['docs/architecture/roadmap.md'],
  },
];

export default function Docs() {
  return (
    <DocPage
      title="PARADA documentation."
      lead={
        <>
          How the system is laid out, set up, run, tested and deployed, summarised from the{' '}
          <a href={GITHUB_URL} rel="noopener">
            project repository
          </a>
          . The repository stays the source of truth.
        </>
      }
      sections={sections}
    />
  );
}
