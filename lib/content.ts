// Single source of truth for every fact on the site. HTML and the 3D scene both read from here.
// Source: parada.lorenzmalabanan.com (Oct 2026). Do not add claims that are not on that site.

export const SITE_URL = 'https://parada.lorenzmalabanan.com';
export const GITHUB_URL = 'https://github.com/E1yWrites/parada';
/** A file in the PARADA repository, for "Source:" links on the docs and legal pages. */
export const repoFile = (path: string) => `${GITHUB_URL}/blob/main/${path}`;
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

// `why`: how each stop answers the problem (the defense retells the trip as the answer).
export const PIPELINE = [
  { id: 'arrive', title: 'Vehicle arrives', body: 'The vehicle reaches a zone gate or entry point.', why: 'No sensor waits in the bay: counting happens at the gate.' },
  { id: 'camera', title: 'Zone-gate camera', body: 'The gate camera observes the vehicle and captures the license plate.', why: 'A standard camera, fixed at the gate, sees every car from the same spot.' },
  { id: 'ocr', title: 'Computer vision + OCR', body: 'Image processing reads the plate text.', why: 'OpenCV finds the plate; EasyOCR reads it.' },
  { id: 'api', title: 'PARADA API', body: 'The API determines the vehicle, user, zone, reservation, and admission policy.', why: 'One backend decides; no client works out occupancy on its own.' },
  { id: 'resolve', title: 'Vehicle / user / guest resolution', body: 'The plate resolves to a registered vehicle and user, or a guest candidate under policy.', why: 'Unknown plates are not waved through: guests follow the establishment’s admission policy.' },
  { id: 'occupancy', title: 'Occupancy + session', body: 'Zone occupancy and the parking session update in the same transaction.', why: 'Count and session change together, so they never disagree.' },
  { id: 'clients', title: 'Mobile + admin', body: 'Both clients read the same backend-authoritative state — drivers on mobile, administrators on the web dashboard.', why: 'Drivers and administrators see the same number: the problem, answered.' },
  { id: 'exit', title: 'Vehicle exits', body: 'The exit camera/OCR event enters the API.', why: 'Leaving is the same read in reverse, at the exit camera.' },
  { id: 'fee', title: 'Session completed + fee', body: 'The backend closes the session and calculates the fee where configured.', why: 'The session closes with its duration and fee: the record administrators lacked.' },
] as const;

export const RECEIPT = { plate: DEMO_PLATE, zone: 'A — North parking area', duration: '02:14', rate: 'Configured', fee: 'Calculated' };

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

// ---------- the final defense ----------
// From the capstone paper (PARADA.pdf, May 2026: cover, 1.0 Introduction, Objectives, 2.0 Literature Review,
// 3.0 Methods, Appendix A) and the app repository's Phase 14 evaluation (docs/vision/phase14-evaluation.md,
// measured 2026-09-14). Quote the paper; never round a measured figure into a better one.
export const THESIS = {
  title: 'PARADA: A Mobile and Web-Based Smart Guided Parking System Using OCR-Assisted Cameras for Zone-Based Occupancy Detection',
  kind: 'A Capstone Project',
  degree: 'Bachelor of Science in Information Technology, Specialized in Multimedia Technology',
  school: 'Lyceum of the Philippines University — Batangas',
  date: 'May 2026',
  proponents: ['Albert G. Abrenica III', 'Jade Drix Stiphen P. Atienza', 'Joshua Shadrach O. Cezar', 'Lance Tristan E. Hilario', 'Lorenz Lanz V. Malabanan'],
};

// Statement of the problem, as the paper's Introduction sets it out (it has no separate section); `answer` is the
// specific objective that takes each point on.
export const PROBLEM = {
  general:
    'When parking information is mainly handled through manual observation, users may not know which areas have available spaces, and administrators may have limited real-time information for monitoring the facility.',
  specific: [
    { text: 'Drivers spend time looking for an available space.', answer: 2 },
    { text: 'Parking personnel have difficulty keeping track of occupied spaces and parking activity.', answer: 1 },
    { text: 'Administrators have limited real-time information for monitoring the facility.', answer: 3 },
    { text: 'Dedicated sensors for many spaces raise installation and maintenance requirements that small to medium-sized facilities may not find practical.', answer: 1 },
    { text: 'Camera-based monitoring is affected by camera position, lighting, image quality and the layout of the parking area.', answer: 4 },
  ],
};

// What has been tried (Introduction; Literature Review).
export const PRIOR = [
  { who: 'Maristela et al. (2024)', where: 'LPU-Batangas Main Campus', how: 'IoT-based parking and monitoring, sensors on the parking spaces' },
  { who: 'Lucina et al. (2024)', where: 'Bestlink College of the Philippines', how: 'IR proximity sensors, an I²C display, a servo motor and an Arduino Uno' },
  { who: 'Dichoso (2022)', where: 'Automated parking management', how: 'RFID for vehicle identification and access control' },
];

// Camera-based work the design leans on, and the conditions it warns about (Literature Review).
export const CAMERA_WORK = [
  { who: 'Araneta et al. (2025)', text: 'Real-time illegal parking detection with automatic plate recognition (YOLOv5) in Butuan City.' },
  { who: 'Jose et al. (2024)', text: 'Vision-based vehicle entry monitoring with standard cameras in a Las Piñas subdivision.' },
  { who: 'Cruz et al. (2024)', text: 'Parking area monitoring and management with computer vision.' },
];

// Appendix A: the interview request, and how the scope changed after it.
export const INTERVIEW = {
  date: 'May 11, 2026',
  with: 'Dr. Conrado I. Dotong',
  role: 'Assistant Vice President for Student Services, LPU-Batangas',
  objective: 'To gather operational insights, understand parking-related challenges, and obtain institutional feedback for system refinement.',
  oldTitle: 'PARADA: A Zone-Based Parking Compliance and Analytics System with Vehicle Tracking and Smart Allocation',
  excluded: ['Violation detection', 'Compliance monitoring', 'Penalty generation', 'Legal enforcement', 'IoT per-slot sensors'],
};

// Objectives of the Study, verbatim.
export const OBJECTIVES = {
  general:
    'This study aims to develop PARADA, a mobile and web-based smart guided parking system that uses standard cameras with OCR-assisted processing to support zone-based parking occupancy detection, parking reservation, user guidance, and administrative monitoring.',
  specific: [
    'Develop an OCR-assisted camera-based parking monitoring module that uses standard cameras assigned to parking zones to process parking information and update the occupancy status of parking spaces.',
    'Develop a mobile application for parking users that provides parking zone information, available spaces, parking reservations, guided parking assistance, parking session monitoring, notifications, vehicle management, parking history, fees, and related parking records.',
    'Implement a web-based administrative system that allows administrators to manage parking zones, cameras, users, vehicles, reservations, parking sessions, occupancy records, notifications, analytics, violations, appeals, and other parking facility information.',
    'Evaluate the PARADA system in terms of functionality, reliability, usability, responsiveness, and effectiveness through structured system testing and user acceptance testing involving intended users and parking personnel.',
  ],
};

// Where the paper and the built system differ, the system wins: scope, development and data flow below come from the
// app repository (README, docs/architecture/roadmap.md), not the paper's plan.
export const SCOPE = {
  covers: [
    'Small to medium-sized facilities: about 50–100 spaces across multiple zones',
    'Gate-based entry and exit counting with standard cameras and OCR',
    'Zone-level availability (capacity − occupied) as the authoritative figure',
    'A mobile app for drivers and a web dashboard for administrators; two roles, User and Admin',
  ],
  leaves: [
    'A sensor in every slot, or slot-level occupancy: slots are layout and inventory only',
    'Legal enforcement: violations and appeals are records the establishment reviews',
    'A finished public deployment: Phase 15 is still pending',
  ],
};

// The roadmap the system was actually built by: [phase, title, done].
export const ROADMAP: [string, string, boolean][] = [
  ['0', 'Requirements + architecture', true],
  ['1', 'Project infrastructure', true],
  ['2', 'Database', true],
  ['3', 'Backend foundation', true],
  ['4', 'Authentication + authorization', true],
  ['5', 'Vision/OCR foundation', true],
  ['6', 'Guests, reservations, zone assignment', true],
  ['7', 'Admin web application', true],
  ['8', 'Mobile application', true],
  ['9', 'Mobile integration + GPS navigation', true],
  ['10', 'Admin overhaul + system audit fixes', true],
  ['11', 'OCR model, gate cameras, configuration', true],
  ['12', 'Real-time updates (SSE)', true],
  ['13', 'Full system integration', true],
  ['14', 'Testing + accuracy evaluation', true],
  ['15', 'Deployment', false],
  ['16', 'Documentation + final review', false],
];

// How data moves through the built system (README, Data Flow): three outside parties, one backend.
export const CONTEXT = [
  { who: 'Driver · mobile app', gives: 'Account, vehicles, zone choice, reservations, payments, appeals', gets: 'Zone availability and recommendation, assignment, GPS navigation, current parking, history, fees, notifications' },
  { who: 'Gate cameras · vision service', gives: 'Plate reads as entry and exit events, over HTTP', gets: '' },
  { who: 'Administrator · web dashboard', gives: 'Zones, capacity, slot inventory, gate cameras, fee and guest policy, guest admission, violation and appeal decisions', gets: 'Live dashboard, sessions, anomalies, notifications, history, analytics' },
];

// Phase 14 evaluation (synthetic dataset, live processes on one host).
export const RESULTS = {
  date: 'September 14, 2026',
  dataset: '1,250 generated images: 50 plate texts × 23 conditions, plus 100 no-plate scenes',
  fields: [
    { label: 'Exact plate reads', value: '77.4%', note: '890 of 1,150; misses count as wrong' },
    { label: 'Character accuracy', value: '93.8%', note: 'on detected plates' },
    { label: 'False positives', value: '0 / 100', note: 'no-plate scenes' },
    { label: 'Plate read → live update', value: '391 ms', note: 'median, Vision → API → database → admin dashboard' },
    { label: 'Automated tests', value: '801', note: 'passed across database, API, admin, mobile, types and vision' },
  ],
  strong: 'Clean plates, dark and bright lighting, sensor noise, Gaussian blur, moderate angles: 96–100%.',
  weak: [
    { cond: 'Far plates (100 px wide)', value: '0%', why: 'below the detector’s minimum size' },
    { cond: 'Horizontal motion blur', value: '0%', why: 'blur erases the edges the detector looks for' },
    { cond: 'Oversized plates (400 px)', value: '20%', why: 'reads come back cut short' },
  ],
  limits: [
    'Synthetic images only: no real vehicle photos were available under a usage permission.',
    'Physical cameras were tested for connection and false positives; no plate was shown to them.',
    'Latency is one client on one machine; no concurrency claim.',
    'User acceptance testing (Objective 4) is not part of this evaluation.',
  ],
};

export const CONCLUSIONS = [
  'Counting at the zone gates replaces a sensor in every slot with standard cameras at the zone’s gates.',
  'One plate read updates the zone count, the parking session and the admin dashboard in under half a second.',
  'On clear, well-framed plates the reader is near-perfect; distance, motion blur and partial plates are its limits.',
];
export const RECOMMENDATIONS = [
  'Evaluate on real photos from the campus gates, with permission from the institution.',
  'Mount gate cameras so plates fill 150–300 px and cars pass slowly under the boom.',
  'Validate plate format and length: OCR confidence alone does not catch partial reads.',
  'Run user acceptance testing with drivers and parking personnel, then a controlled pilot.',
];
