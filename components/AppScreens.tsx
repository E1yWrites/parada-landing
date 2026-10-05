// The two PARADA clients at step 7, drawn after the app's own design (E1yWrites/parada: apps/mobile src/theme
// dark register, apps/admin globals.css, docs/mockups): the driver app's "Home: parked" screen and the admin
// console dashboard, both showing the state right after the tour car's entry. Figures come from lib/content.ts.
import { Space_Grotesk, Inter } from 'next/font/google';
import { ZONES, DEMO_PLATE, RECEIPT, ACTIVE_SESSIONS, ACTIVITY, CAMERAS, FLAGS, totals } from '@/lib/content';

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--app-display', preload: false });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--app-sans', preload: false });

// After the tour's entry: Zone A gained one car and one session.
const zones = ZONES.map((z, i) => ({ ...z, occupied: z.occupied + (i === 0 ? 1 : 0) }));
const all = totals(zones);
const online = CAMERAS.filter((c) => c.status === 'ONLINE').length;

function Icon({ d, circle }: { d: string; circle?: [number, number, number] }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {circle && <circle cx={circle[0]} cy={circle[1]} r={circle[2]} />}
      <path d={d} />
    </svg>
  );
}
const I = {
  home: { d: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
  car: { d: 'M5 16v-5l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M5 11h14' },
  clock: { d: 'M12 7v5l3 2', circle: [12, 12, 9] as [number, number, number] },
  user: { d: 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', circle: [12, 8, 4] as [number, number, number] },
  grid: { d: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  pin: { d: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z', circle: [12, 9, 2.5] as [number, number, number] },
  cam: { d: 'M4 7h3l2-3h6l2 3h3v12H4z', circle: [12, 13, 3.5] as [number, number, number] },
  nav: { d: 'M3 11l18-8-8 18-2-8z' },
  bell: { d: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0' },
};

export default function AppScreens() {
  const a = zones[0];
  return (
    <div className={`app-ui ${grotesk.variable} ${inter.variable}`} aria-hidden="true">
      {/* admin console, in a browser frame */}
      <div className="adm">
        <div className="adm-bar">
          <i />
          <i />
          <i />
          <span>parada.local</span>
        </div>
        <div className="adm-body">
          <nav className="adm-side">
            <img src="/brand/logo.webp" alt="" className="adm-logo" />
            <b className="adm-group">Overview</b>
            <span className="adm-link is-on">
              <Icon {...I.grid} />
              Dashboard
            </span>
            <b className="adm-group">Parking operations</b>
            <span className="adm-link">
              <Icon {...I.pin} />
              Zones
            </span>
            <span className="adm-link">
              <Icon {...I.cam} />
              Cameras
            </span>
            <span className="adm-link">
              <Icon {...I.clock} />
              Sessions
            </span>
          </nav>
          <div className="adm-main">
            <div className="adm-top">
              <span className="adm-live">Live facility state</span>
              <Icon {...I.bell} />
            </div>
            <h4>Dashboard</h4>
            <p className="adm-sub">Real-time parking management overview</p>
            <div className="adm-metrics">
              <div className="adm-card adm-hero">
                <span>Total Occupancy</span>
                <strong>
                  {all.occupied}
                  <em>/</em>
                  {all.capacity}
                </strong>
                <small>{zones.length} zones reporting</small>
                <i style={{ '--pct': `${(all.occupied / all.capacity) * 100}%` } as React.CSSProperties} />
              </div>
              <div className="adm-card">
                <span>Active Sessions</span>
                <strong>{ACTIVE_SESSIONS + 1}</strong>
                <small>open right now</small>
              </div>
              <div className="adm-card">
                <span>Available Spaces</span>
                <strong>{all.available}</strong>
                <small>open spaces right now</small>
              </div>
              <div className="adm-card">
                <span>Camera Status</span>
                <strong>
                  {online}/{CAMERAS.length}
                </strong>
                <small>gate cameras online</small>
              </div>
            </div>
            <div className="adm-alerts">
              <span className="adm-card-title">Live Alerts</span>
              <p className="ok">
                Session opened · {DEMO_PLATE} · {a.name}
              </p>
              {FLAGS.slice()
                .reverse()
                .map((f) => (
                  <p key={f}>{f}</p>
                ))}
            </div>
            <table className="adm-table">
              <tbody>
                {ACTIVITY.slice(0, 3).map((r) => (
                  <tr key={r.time}>
                    <td className="mono">{r.time}</td>
                    <td>{r.kind}</td>
                    <td className="mono">{r.plate}</td>
                    <td>{r.zone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* driver app, Home with a session open */}
      <div className="drv">
        <div className="drv-status">
          <span>9:41</span>
          <i className="drv-island" />
          <span className="drv-bat" />
        </div>
        <div className="drv-head">
          <b>Home</b>
          <span>Live zone availability from the gate cameras</span>
        </div>
        <div className="drv-card">
          <div className="drv-row">
            <span className="drv-badge">Parked</span>
            <span className="drv-code">{a.code}</span>
          </div>
          <img src="/brand/mascot-excited.webp" alt="" className="drv-mascot" />
          <b className="drv-zone">{a.name}</b>
          <span className="drv-plate">{DEMO_PLATE}</span>
          <span className="drv-label">Session elapsed</span>
          <span className="drv-timer">00:{RECEIPT.duration}</span>
          <span className="drv-btn">
            <Icon {...I.nav} />
            Navigate to parking
          </span>
        </div>
        <div className="drv-zones">
          {zones.map((z) => (
            <div key={z.code}>
              <span className="drv-code">{z.code}</span>
              <span>{z.name}</span>
              <b>{z.capacity - z.occupied}</b>
              <small>available</small>
            </div>
          ))}
        </div>
        <div className="drv-tabs">
          <span className="is-on">
            <Icon {...I.home} />
            Home
          </span>
          <span>
            <Icon {...I.car} />
            Park
          </span>
          <span>
            <Icon {...I.clock} />
            Sessions
          </span>
          <span>
            <Icon {...I.user} />
            Account
          </span>
        </div>
      </div>
    </div>
  );
}
