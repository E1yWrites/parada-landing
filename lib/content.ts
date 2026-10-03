// Single source of truth for every fact on the site. HTML and the 3D scene both read from here.
// Source: parada-landing.vercel.app (Oct 2026). Do not add claims that are not on that site.

export const SITE_URL = 'https://parada-landing.vercel.app';
export const GITHUB_URL = 'https://github.com/E1yWrites/parada';
export const EMAIL = 'lorenzlanzmalabanan@lpubatangas.edu.ph';
export const DESCRIPTION =
  'PARADA is a mobile and web-based smart parking management system using computer vision, license-plate recognition, and zone-based occupancy monitoring.';

export type Zone = { code: 'A' | 'B' | 'C'; name: string; area: string; capacity: number; occupied: number };

export const ZONES: Zone[] = [
  { code: 'A', name: 'Zone A', area: 'North parking area', capacity: 30, occupied: 18 },
  { code: 'B', name: 'Zone B', area: 'East parking area', capacity: 50, occupied: 42 },
  { code: 'C', name: 'Zone C', area: 'South parking area', capacity: 40, occupied: 15 },
];

export const totals = (zones: Zone[]) => {
  const capacity = zones.reduce((s, z) => s + z.capacity, 0);
  const occupied = zones.reduce((s, z) => s + z.occupied, 0);
  return { capacity, occupied, available: capacity - occupied };
};

// Occupancy band drives the free → near-full colour ramp.
export const band = (z: Zone): 'free' | 'busy' | 'full' => {
  const r = z.occupied / z.capacity;
  return r >= 0.8 ? 'full' : r >= 0.5 ? 'busy' : 'free';
};

export const DEMO_PLATE = 'ABC 1234';

export const PIPELINE = [
  { id: 'arrive', title: 'Vehicle arrives', body: 'The vehicle reaches a zone gate or entry point.' },
  { id: 'camera', title: 'Zone-gate camera', body: 'The gate camera observes the vehicle and captures the license plate.' },
  { id: 'ocr', title: 'Computer vision + OCR', body: 'Image processing reads the plate text.' },
  { id: 'api', title: 'PARADA API', body: 'The API determines the vehicle, user, zone, reservation, and admission policy.' },
  { id: 'resolve', title: 'Vehicle / user / guest resolution', body: 'The plate resolves to a registered vehicle and user, or a guest candidate under policy.' },
  { id: 'occupancy', title: 'Occupancy + session', body: 'Zone occupancy and the parking session update in the same transaction.' },
  { id: 'clients', title: 'Mobile + admin', body: 'Both clients read the same backend-authoritative state — drivers on mobile, administrators on the web dashboard.' },
  { id: 'exit', title: 'Vehicle exits', body: 'The exit camera/OCR event enters the API.' },
  { id: 'fee', title: 'Session completed + fee', body: 'The backend closes the session and calculates the fee where configured.' },
] as const;

export const RECEIPT = { plate: DEMO_PLATE, zone: 'A — North parking area', duration: '02:14', rate: 'Configured', fee: 'Calculated' };

export const PROBLEMS = [
  { who: 'For drivers', text: 'Uncertainty about where capacity is available.' },
  { who: 'For administrators', text: 'Difficulty monitoring occupancy and parking activity manually.' },
  { who: 'For establishments', text: 'Disconnected parking operations and limited visibility into utilization.' },
];

// Reworded at zone level using only listed features (zone availability, recommendation,
// assignment, reservations, GPS navigation, current status, history). The live site's
// slot-level claims ("lock your bay", EV filters, extensions) are not listed features.
export const MOBILE_STEPS = [
  { title: 'Find parking', body: 'Live availability across every zone. See open capacity before you even leave.' },
  { title: 'Choose your zone', body: 'Compare zones by availability and get a recommended zone.' },
  { title: 'Reserve', body: 'Reserve parking in a zone; PARADA assigns and confirms your zone.' },
  { title: 'Navigate', body: 'GPS navigation to your assigned zone. No more circling the lot.' },
  { title: 'Track', body: 'Your current parking status and session, with parking history kept for later.' },
];

export const ADMIN_VERBS = [
  { title: 'Monitor', body: 'Zones, occupancy, sessions, cameras.' },
  { title: 'Manage', body: 'Zones, capacities, cameras, reservations, users, vehicles.' },
  { title: 'Respond', body: 'Violations, appeals, guest admission issues, anomalies.' },
  { title: 'Analyze', body: 'Parking activity and utilization.' },
];

export const ACTIVE_SESSIONS = 8;
export const ACTIVITY = [
  { kind: 'ENTRY', plate: 'ABC 1234', zone: 'Zone A', time: '09:42' },
  { kind: 'EXIT', plate: 'XYZ 5678', zone: 'Zone B', time: '09:38' },
  { kind: 'ENTRY', plate: 'MNO 9999', zone: 'Zone C', time: '09:31' },
  { kind: 'GUEST', plate: '—', zone: 'Zone A', time: '09:19' },
];
export const CAMERAS = [
  { id: 'cam-a-entry', status: 'ONLINE' },
  { id: 'cam-a-exit', status: 'ONLINE' },
  { id: 'cam-b-entry', status: 'DEGRADED' },
  { id: 'cam-c-entry', status: 'ONLINE' },
];
// Live site flagged "Zone A 60% — near full"; Zone B (84%) is the near-full zone.
export const FLAGS = ['Unknown vehicle at Zone C gate', 'Zone B 84% — near full'];

export const ARCHITECTURE = [
  { id: 'camera', name: 'Zone Gate Camera', tech: 'Entry / exit vehicle events' },
  { id: 'cv', name: 'Computer Vision / OCR', tech: 'Python · FastAPI · OpenCV · EasyOCR' },
  { id: 'api', name: 'PARADA API', tech: 'Node.js · Express · TypeScript' },
  { id: 'resolve', name: 'User / Vehicle Resolution', tech: 'Registered or guest candidate' },
  { id: 'zones', name: 'Zones & Occupancy', tech: 'Capacity − occupied' },
  { id: 'sessions', name: 'Sessions & Fees', tech: 'Lifecycle, duration, fee' },
  { id: 'db', name: 'Database', tech: 'PostgreSQL · Prisma' },
  { id: 'mobile', name: 'Mobile Application', tech: 'React Native · Expo — drivers' },
  { id: 'admin', name: 'Admin Web Panel', tech: 'Next.js — operations' },
] as const;

export const FEATURES = [
  {
    module: 'Driver features',
    items: ['Account registration and authentication', 'Multiple vehicle registration', 'Zone availability', 'Zone recommendation', 'Zone assignment', 'Reservations', 'Current parking status', 'Parking history', 'GPS navigation', 'Guest-related parking behavior'],
  },
  {
    module: 'Parking intelligence',
    items: ['Camera-based vehicle observation', 'License plate recognition', 'OCR', 'Vehicle identification', 'Zone occupancy', 'Entry/exit processing', 'Guest admission', 'Session lifecycle'],
  },
  {
    module: 'Administration',
    items: ['Zone management', 'Capacity configuration', 'Camera configuration', 'Session monitoring', 'Reservation management', 'User and vehicle management', 'Violations', 'Appeals', 'Notifications', 'Analytics', 'Establishment configuration'],
  },
];

export const CONFIG = [
  { group: 'Zones', fields: ['Name', 'Code', 'Capacity', 'Status'] },
  { group: 'Cameras', fields: ['Identifier', 'Zone', 'Direction', 'Operational status'] },
  { group: 'Policies', fields: ['Guest policy', 'Reservation settings', 'Parking fees', 'Violation rules'] },
  { group: 'Location', fields: ['Address', 'Latitude', 'Longitude'] },
];

export const STACK = [
  { group: 'Mobile', items: ['React Native', 'Expo', 'TypeScript'] },
  { group: 'Web', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'TypeScript'] },
  { group: 'Database', items: ['PostgreSQL', 'Prisma'] },
  { group: 'Computer vision', items: ['Python', 'FastAPI', 'EasyOCR', 'OpenCV'] },
];

export const SECURITY = [
  { title: 'Authentication', body: 'JWT-based authentication.' },
  { title: 'Authorization', body: 'Two roles: USER and ADMIN.' },
  { title: 'Ownership', body: 'Users can only access their own parking-related records.' },
  { title: 'Camera trust', body: 'Camera events use a separate authentication boundary.' },
  { title: 'Data integrity', body: 'Critical parking operations are handled by the backend/domain layer and database constraints.' },
];

export const STATUS = {
  implemented: ['Mobile application', 'Admin web application', 'Backend API', 'PostgreSQL database', 'Zone-based occupancy', 'Reservations', 'Zone assignment', 'Guest admission', 'GPS navigation', 'Camera configuration'],
  continuing: ['OCR / computer vision (real model)', 'Real-time integration', 'Full system integration', 'Testing + accuracy evaluation', 'Deployment', 'Documentation + final review'],
};

export const JOURNEY = ['Requirements', 'Architecture', 'Infrastructure', 'Database', 'Backend', 'Authentication', 'Parking operations', 'Admin web', 'Mobile', 'GPS', 'Computer vision', 'System integration'];

export const HIGHLIGHTS = [
  { title: 'Computer vision', body: 'Identifies vehicles from camera observations.' },
  { title: 'Zone intelligence', body: 'Makes availability understandable at the zone level.' },
  { title: 'Mobile + web', body: 'Drivers and administrators use connected interfaces.' },
  { title: 'Configurable', body: 'Parking facilities can configure zones, capacities, cameras, and policies.' },
  { title: 'Backend-authoritative', body: 'Critical parking state is managed centrally instead of being independently calculated by each client.' },
];
