// Single source of truth for every fact on the site. HTML and the 3D scene both read from here.
// The site speaks to the people who would bring PARADA to their campus: plain words, no jargon, every figure with its caveat.
// Every fact is from the final capstone paper (parada-V2 (1).pdf, November 2026), cited by
// section, figure or table. Quote the paper; never round a measured figure into a better one, and never drop the caveat
// the paper puts next to it. Demo figures (zones, plates, times) are labelled as demo wherever they appear.

export const SITE_URL = 'https://parada.lorenzmalabanan.com';
export const GITHUB_URL = 'https://github.com/E1yWrites/parada';
/** A file in the PARADA repository, for "Source:" links on the docs and legal pages. */
export const repoFile = (path: string) => `${GITHUB_URL}/blob/main/${path}`;
export const EMAIL = 'lorenzlanzmalabanan@lpubatangas.edu.ph';
// Said plainly, for the people who would bring PARADA to their campus (the abstract's first paragraph, without the jargon).
export const DESCRIPTION =
  'PARADA is a smart parking system for campuses and other sites with several parking areas. Ordinary cameras at each area’s gates read plates and keep a live count, so drivers see where there is room before they arrive and staff see every area at a glance. Built and tested at Lyceum of the Philippines University — Batangas, and ready to pilot.';

export type Zone = { code: 'A' | 'B' | 'C'; name: string; area: string; capacity: number; occupied: number };

// Demo facility inside the paper's scope (about 50 to 100 spaces across multiple zones). Zone B sits at 15% free, under
// the prototype's 20% low-availability threshold, so it raises the alert the paper describes.
export const ZONES: Zone[] = [
  { code: 'A', name: 'Zone A', area: 'North parking area', capacity: 30, occupied: 18 },
  { code: 'B', name: 'Zone B', area: 'East parking area', capacity: 40, occupied: 34 },
  { code: 'C', name: 'Zone C', area: 'South parking area', capacity: 30, occupied: 12 },
];

export const totals = (zones: Zone[]) => {
  const capacity = zones.reduce((s, z) => s + z.capacity, 0);
  const occupied = zones.reduce((s, z) => s + z.occupied, 0);
  return { capacity, occupied, available: capacity - occupied };
};

// Occupancy band drives the free → near-full colour ramp; 'full' starts where 20% or less is free (the low-availability alert).
export const band = (z: Zone): 'free' | 'busy' | 'full' => {
  const r = z.occupied / z.capacity;
  return r >= 0.8 ? 'full' : r >= 0.5 ? 'busy' : 'free';
};

export const DEMO_PLATE = 'ABC 1234';

// One car through the gates, as the Level 1 DFD's processes 3.0 and 4.0 describe it, in plain words: the demo's tour.
export const PIPELINE = [
  { id: 'arrive', title: 'A car pulls up', body: 'A driver reaches the entrance to Zone A. There is no sensor in any parking space: the gates do the counting.' },
  { id: 'camera', title: 'The gate camera sees it', body: 'An ordinary IP camera watches the lane. Its video is looked at as it arrives and never saved.' },
  { id: 'ocr', title: 'It reads the plate', body: 'PARADA finds the plate and reads it. A reading only counts once two of three frames agree, or once PARADA is very sure.' },
  { id: 'api', title: 'The reading is checked', body: 'The plate, the camera and the time go to PARADA’s server, which ignores repeats and anything from a camera it doesn’t know.' },
  { id: 'resolve', title: 'Registered or guest?', body: 'The plate is matched to a registered vehicle. A plate that matches no one is treated as a guest, under the rules your site sets.' },
  { id: 'occupancy', title: 'The count goes up', body: 'Zone A’s count rises by one and the parking session starts. The count can never drop below zero or pass the zone’s capacity.' },
  { id: 'clients', title: 'Every screen updates', body: 'The driver’s app and the office dashboard change together: a median of 0.39 s from the gate to the admin screen in testing.' },
  { id: 'exit', title: 'The car leaves', body: 'The exit camera reads the plate the same way, and the zone’s count drops back.' },
  { id: 'fee', title: 'Session closed, receipt issued', body: 'PARADA records how long the car stayed and works out the fee from the site’s own rates. The demo uses the prototype’s default.' },
] as const;

// The prototype's default fee (3.0 Design and Prototype): ₱20 for the first two hours, ₱10 per started hour after.
export const FEE_RATE = '₱20 first 2 h · ₱10 per started hour after';
export const parkingFee = (minutes: number) => 20 + 10 * Math.max(0, Math.ceil((minutes - 120) / 60));
export const RECEIPT = { plate: DEMO_PLATE, zone: 'A — North parking area', duration: '02:14', rate: FEE_RATE, fee: `₱${parkingFee(2)}` };

// The driver's path through the mobile app (4.0 User Interfaces, Figures 28–49).
export const MOBILE_STEPS = [
  { title: 'See where there’s room', body: 'Every parking area’s free spaces, live, with the least busy one marked.' },
  { title: 'Reserve a space', body: 'Hold a space in an area for now, 30 minutes or an hour from now.' },
  { title: 'Get directions', body: 'Straight to the area, instead of circling the lot.' },
  { title: 'Track the visit', body: 'Time parked, fees and history, all in the app.' },
];

// The administrative console (4.0 User Interfaces, Figures 9–27).
export const ADMIN_VERBS = [
  { title: 'Watch every area', body: 'How full each area is, which cameras are on, and the day’s trend.' },
  { title: 'Handle the exceptions', body: 'Guest entries, alerts and parking violations, as they happen.' },
  { title: 'Set the rules', body: 'Areas, cameras, fees, reservation windows and guest policy.' },
  { title: 'See the patterns', body: 'Busy hours, sessions and fee revenue over time.' },
];

// Demo rows for the admin dashboard mock (Figures 10–12: Recent Alerts, Recent Gate Events).
export const ACTIVITY = [
  { kind: 'ENTRY', plate: 'ABC 1234', zone: 'Zone A', time: '09:42' },
  { kind: 'EXIT', plate: 'XYZ 5678', zone: 'Zone B', time: '09:38' },
  { kind: 'ENTRY', plate: 'MNO 9999', zone: 'Zone C', time: '09:31' },
];
// The redesign renamed camera "Online" to "Enabled" (3.0 Design and Prototype): status is configuration, not a measurement.
export const CAMERAS = ['a', 'b', 'c'].flatMap((z) => [
  { id: `cam-${z}-entry`, status: 'ENABLED' },
  { id: `cam-${z}-exit`, status: 'ENABLED' },
]);
export const FLAGS = ['Guest entry denied · Zone A gate', 'Low availability · Zone B, 6 of 40 free'];

// System Architecture (Figure 7): five components with one authority.
export const ARCHITECTURE = [
  { id: 'camera', name: 'Gate cameras', tech: 'USB, RTSP or a video file · frames only' },
  { id: 'cv', name: 'Vision service', tech: 'Python 3.11 · FastAPI · OpenCV 5 · EasyOCR 1.7.2 · sends plate readings only' },
  { id: 'api', name: 'Backend API', tech: 'Node.js · Express 5 · TypeScript · authentication, roles and all domain rules' },
  { id: 'db', name: 'Database', tech: 'PostgreSQL 18 · Prisma 7 · read and written only by the API' },
  { id: 'mobile', name: 'Mobile application', tech: 'React Native 0.88 · Expo SDK 58 · REST, live updates over SSE' },
  { id: 'admin', name: 'Administrative web application', tech: 'Next.js 16 · React 19 · server-side proxy, HttpOnly session cookie' },
] as const;

export const FEATURES = [
  {
    module: 'Driver mobile application',
    items: ['Registration with email verification', 'Sign-in and password recovery', 'Vehicle registration', 'Zone availability and least-busy zone', 'Zone assignment', 'Reservations with an arrival window', 'Directions to a zone', 'Current parking (Now)', 'Parking history', 'Notifications', 'Payments and fees', 'Violations and appeals'],
  },
  {
    module: 'Gate cameras and vision',
    items: ['Plate-region detection', 'Whole-frame fallback', 'EasyOCR plate reading', 'Philippine plate-format check', 'Two-of-three-frame confirmation', 'One report per vehicle in view', 'Entry and exit events'],
  },
  {
    module: 'Administrative console',
    items: ['Dashboard', 'Zone management', 'Camera management', 'Parking sessions', 'Reservation management', 'Violations and appeals', 'Anomalies', 'Guest admission', 'User management', 'Occupancy history', 'Analytics', 'Notifications', 'Data simulator', 'Establishment settings'],
  },
];

// Establishment Settings (Figures 26–27), zone and camera management (Figures 13–14).
export const CONFIG = [
  { group: 'Zones', fields: ['Name', 'Code', 'Capacity', 'Physical spaces (layout only)', 'Active'] },
  { group: 'Cameras', fields: ['Identifier', 'Zone', 'Direction: entry, exit or both', 'Enabled'] },
  { group: 'Fees', fields: ['Base fee', 'Base duration', 'Additional fee per hour'] },
  { group: 'Guests and zones', fields: ['Guest admission policy', 'Primary guest zone', 'Reservation window', 'Low-availability threshold'] },
  { group: 'Navigation and violations', fields: ['Navigation destination', 'Violation types, fines and descriptions'] },
];

// 3.0 Tools and System Requirements.
export const STACK = [
  { group: 'Mobile', items: ['React Native 0.88', 'Expo SDK 58', 'Expo Router', 'TypeScript', 'Expo SecureStore'] },
  { group: 'Web', items: ['Next.js 16', 'React 19', 'Tailwind CSS 4'] },
  { group: 'Backend', items: ['Node.js 22.13+ / 24.3+', 'Express 5', 'TypeScript', 'Argon2', 'JSON Web Tokens'] },
  { group: 'Database', items: ['PostgreSQL 18', 'Prisma 7', 'Embedded cluster for development'] },
  { group: 'Vision', items: ['Python 3.11', 'FastAPI', 'OpenCV 5', 'NumPy', 'EasyOCR 1.7.2'] },
  { group: 'Quality', items: ['Turborepo', 'Jest 30', 'React Native Testing Library', 'pytest', 'ESLint'] },
];

// 3.0 Design and Prototype and Deployment Phase.
export const SECURITY = [
  { title: 'Authentication', body: 'Passwords stored only as Argon2 one-way hashes; sessions are JSON Web Tokens; revoked tokens are kept in their own table.' },
  { title: 'Authorization', body: 'Users carry a role, driver or administrator; the console refuses accounts that are not administrators, and the API applies roles and all domain rules.' },
  { title: 'Admin sessions', body: 'The console reaches the API through a server-side proxy; the session token lives in a secure, HttpOnly cookie.' },
  { title: 'Camera trust', body: 'Every camera event carries the camera’s key; production refuses to start without a camera API key.' },
  { title: 'Data integrity', body: 'Database constraints keep occupancy between zero and capacity and allow one active session, assignment and plate registration at a time.' },
];

// Status as of the final paper: a demonstration prototype; `continuing` is the paper's Recommendations.
export const STATUS = {
  implemented: ['Mobile application', 'Administrative web application', 'Backend API', 'Vision and OCR service', 'PostgreSQL database', 'Zone-level occupancy', 'Reservations and zone assignment', 'Guest admission', 'Directions to a zone', 'Real-time updates (SSE)', 'Full system integration', 'OCR accuracy evaluation', 'Live IP-camera tests', 'User acceptance test', 'Deployment to a test environment'],
  continuing: ['Evaluate at an actual gate', 'Speed up plate reading', 'Improve reading in difficult conditions', 'Mount cameras for the detector', 'Add online payment', 'Deploy at a pilot facility', 'Extend to more facilities', 'Test the corrections with users', 'Complete the remaining fixes'],
};

export const JOURNEY = ['Requirements', 'Architecture', 'Infrastructure', 'Database', 'Backend', 'Authentication', 'Vision and OCR', 'Reservations', 'Admin web', 'Mobile', 'Real-time', 'Integration', 'Accuracy evaluation', 'Live camera tests', 'Deployment to a test environment', 'User acceptance'];

export const HIGHLIGHTS = [
  { title: 'Gate cameras', body: 'Standard cameras at zone gates replace a sensor in every space.' },
  { title: 'Zone-level occupancy', body: 'Each zone keeps capacity and an occupied count; availability is always capacity minus occupied.' },
  { title: 'Mobile + web', body: 'Drivers and administrators read the same records from one backend.' },
  { title: 'Configurable', body: 'Fees, reservation window, guest policy, thresholds and violation rules are establishment settings.' },
  { title: 'One authority', body: 'Only the backend applies parking rules and writes to the database.' },
];

// ---------- the customer landing page and the demo ----------

// The team, as the paper's title page lists them.
export const TEAM = {
  names: ['Albert G. Abrenica III', 'Jade Drix Stiphen P. Atienza', 'Joshua Shadrach O. Cezar', 'Lance Tristan E. Hilario', 'Lorenz Lanz V. Malabanan'],
  school: 'Lyceum of the Philippines University — Batangas',
  program: 'BS Information Technology',
};

// What a campus has today, in the words of the paper's Introduction, said plainly.
export const PAINS = [
  'Drivers circle the lot looking for a free space.',
  'Guards count cars by eye.',
  'Nobody knows an area is full until they are already in it.',
];

// The trip in three stops, for the landing page (the nine-stop version is PIPELINE, on the demo).
export const STOPS = [
  { title: 'The gate reads the plate', body: 'An ordinary camera at the entrance to a parking area reads the plate as the car drives in.' },
  { title: 'Every screen updates', body: 'That area’s count goes up by one, and the driver’s app and your office dashboard update together. In testing, the dashboard showed it in under half a second.' },
  { title: 'The exit closes it', body: 'A second camera reads the plate on the way out. The count drops back and the driver gets a receipt.' },
];

// The final paper's headline results (4.0 Testing Results), each with the caveat the paper puts beside it, in plain words.
export const PROOF = [
  { value: '87.1%', label: 'plates read exactly', note: '1,002 of 1,150 test images across 23 lighting, angle, blur and weather conditions. The images were generated, not photographed.' },
  { value: '10 / 10', label: 'live reads at night', note: 'Two real IP cameras and a real car, no wrong plate. By day, 9 of 10 with the cameras held steady.' },
  { value: '0.39 s', label: 'from the gate to the office screen', note: 'The median of 40 gate events in testing.' },
];
