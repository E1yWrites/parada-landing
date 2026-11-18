// Single source of truth for every fact on the site. HTML and the 3D scene both read from here.
// Product copy: parada.lorenzmalabanan.com (Oct 2026). Defense facts: the final capstone paper (see "the final defense").

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
  { id: 'ocr', title: 'Computer vision + OCR', body: 'Image processing reads the plate text.', why: 'OpenCV finds the plate, EasyOCR reads it, and only Philippine-format plates (three letters, three or four digits) are kept.' },
  { id: 'api', title: 'PARADA API', body: 'The API determines the vehicle, user, zone, reservation, and admission policy.', why: 'One backend decides; no client works out occupancy on its own.' },
  { id: 'resolve', title: 'Vehicle / user / guest resolution', body: 'The plate resolves to a registered vehicle and user, or a guest candidate under policy.', why: 'Unknown plates are not waved through: guests follow the establishment’s admission policy.' },
  { id: 'occupancy', title: 'Occupancy + session', body: 'Zone occupancy and the parking session update in the same transaction.', why: 'Count and session change together, so they never disagree.' },
  { id: 'clients', title: 'Mobile + admin', body: 'Both clients read the same backend-authoritative state — drivers on mobile, administrators on the web dashboard.', why: 'Drivers and administrators see the same number: the problem, answered.' },
  { id: 'exit', title: 'Vehicle exits', body: 'The exit camera/OCR event enters the API.', why: 'Leaving is the same read in reverse, at the exit camera.' },
  { id: 'fee', title: 'Session completed + fee', body: 'The backend closes the session and calculates the fee where configured.', why: 'The session closes with its duration and fee: the record administrators lacked.' },
] as const;

// The prototype's default fee (paper, 3.0 Design and Prototype): ₱20 for the first two hours, ₱10 per started hour after.
export const FEE_RATE = '₱20 first 2 h · ₱10 per started hour after';
export const parkingFee = (minutes: number) => 20 + 10 * Math.max(0, Math.ceil((minutes - 120) / 60));
export const RECEIPT = { plate: DEMO_PLATE, zone: 'A — North parking area', duration: '02:14', rate: FEE_RATE, fee: `₱${parkingFee(2)}` };

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

// Status as of the final paper (v21, November 2026): built and tested as a demonstration prototype; `continuing` is the
// paper's Recommendations.
export const STATUS = {
  implemented: ['Mobile application', 'Admin web application', 'Backend API', 'PostgreSQL database', 'Zone-based occupancy', 'Reservations + zone assignment', 'Guest admission', 'GPS navigation', 'OCR / computer vision', 'Real-time updates (SSE)', 'Full system integration', 'Accuracy evaluation + live IP-camera tests', 'User acceptance test', 'Deployment profiles: local, online, hybrid, offline'],
  continuing: ['Evaluation at an actual gate', 'Faster plate reading (plate crop or GPU)', 'Online payment (GCash or Maya)', 'Pilot deployment at a parking facility', 'User acceptance test with more respondents'],
};

export const JOURNEY = ['Requirements', 'Architecture', 'Infrastructure', 'Database', 'Backend', 'Authentication', 'Parking operations', 'Admin web', 'Mobile', 'GPS', 'Computer vision', 'System integration', 'Live camera tests', 'User acceptance'];

export const HIGHLIGHTS = [
  { title: 'Computer vision', body: 'Identifies vehicles from camera observations.' },
  { title: 'Zone intelligence', body: 'Makes availability understandable at the zone level.' },
  { title: 'Mobile + web', body: 'Drivers and administrators use connected interfaces.' },
  { title: 'Configurable', body: 'Parking facilities can configure zones, capacities, cameras, and policies.' },
  { title: 'Backend-authoritative', body: 'Critical parking state is managed centrally instead of being independently calculated by each client.' },
];

// ---------- the final defense ----------
// Every fact below is from the final capstone paper (PARADA-Final-Capstone-Paper-FINAL-v21.pdf, November 2026). It is
// newer than the app repository's roadmap, so where they differ the paper wins. Quote the paper; never round a measured
// figure into a better one, and never drop the caveat the paper puts next to it.
export const THESIS = {
  title: 'PARADA: A Mobile and Web-Based Smart Guided Parking System Using OCR-Assisted Cameras for Zone-Based Occupancy Detection',
  kind: 'A Capstone Project',
  degree: 'Bachelor of Science in Information Technology, Specialized in Multimedia Technology',
  school: 'Lyceum of the Philippines University — Batangas',
  date: 'November 2026',
  proponents: ['Albert G. Abrenica III', 'Jade Drix Stiphen P. Atienza', 'Joshua Shadrach O. Cezar', 'Lance Tristan E. Hilario', 'Lorenz Lanz V. Malabanan'],
  adviser: 'Mr. Orland Anne Christian S. De Ocampo, MSIT',
};

// The paper has no separate statement of the problem: the general problem is the Introduction's own sentence, and the
// specific points are the three main problems named in 3.0 Requirement Analysis plus the caveat and gap from 1.0 and 2.0.
// `answer` is the specific objective that takes each point on.
export const PROBLEM = {
  general:
    'Where parking is mainly handled through manual observation, drivers may not know which areas have available spaces, and parking personnel may have difficulty keeping track of occupied spaces and parking activity.',
  specific: [
    { text: 'Drivers have difficulty locating available parking spaces.', answer: 2 },
    { text: 'Parking is monitored manually, so personnel have difficulty keeping track of occupied spaces and parking activity.', answer: 3 },
    { text: 'IoT sensors in every space carry installation and maintenance requirements that may not be practical for small to medium-sized facilities.', answer: 1 },
    { text: 'Existing systems tend to serve either the driver or the administrator, but rarely both from the same records.', answer: 4 },
    { text: 'Camera-based monitoring may be affected by camera placement, lighting, image quality and the layout of the monitored area.', answer: 5 },
  ],
};

// What has been tried on Philippine campuses (1.0 Introduction; 2.0 Smart Parking Systems, IoT-Based Parking Systems).
export const PRIOR = [
  { who: 'Maristela et al. (2024)', where: 'LPU-Batangas Main Campus', how: 'IoT-based parking and monitoring, sensors on the parking spaces' },
  { who: 'Tambong et al. (2021)', where: 'LPU-Cavite (LPU PARK’n GO)', how: 'Android app with real-time availability: the driver’s side only' },
  { who: 'Dichoso et al. (2022)', where: 'Automated parking management', how: 'RFID for vehicle identification and access control' },
];

// Camera-based work the design leans on, and the conditions it warns about (2.0 Camera-Based Parking Monitoring).
export const CAMERA_WORK = [
  { who: 'Araneta et al. (2025)', text: 'Real-time illegal parking detection with automatic plate recognition (YOLOv5) in Butuan City.' },
  { who: 'Jose et al. (2024)', text: 'Vision-based vehicle entry monitoring with standard cameras in a Las Piñas subdivision.' },
  { who: 'Cruz et al. (2024)', text: 'Parking area monitoring and management with computer vision.' },
];

// How the project ran (Gantt Chart, Figure 2, and 3.0 Design and Prototype): [when, what].
export const TIMELINE: [string, string][] = [
  ['23 Apr 2026', 'Proposal oral defense'],
  ['May 2026', 'Consultation and revision'],
  ['29 Aug – 4 Sep', 'First commit; architecture and database designed first'],
  ['26 Sep', 'Design audit (mobile 10/30, admin 11/30) and redesign of both apps'],
  ['Sep – Nov', 'Accuracy evaluation, then live IP-camera tests with a real plate'],
  ['17 Nov 2026', 'User acceptance test'],
  ['17 – 18 Nov', 'Failed UAT tasks traced to the code and corrected'],
];

// Objectives of the Study, verbatim.
export const OBJECTIVES = {
  general:
    'This study aims to develop PARADA, a mobile and web-based smart guided parking system that uses standard cameras and OCR-assisted processing to support gate-based vehicle monitoring, zone-level occupancy detection, parking reservations, user guidance, and administrative management.',
  specific: [
    'Develop a camera-based parking monitoring module that uses OCR-assisted gate-based entry and exit processing and counting to maintain zone-level occupancy records and calculate parking availability based on each zone’s capacity and occupied count.',
    'Develop a mobile application that allows users to view parking zones and availability, make reservations, receive navigation assistance, monitor active parking sessions, manage registered vehicles, receive notifications, and review parking history and parking-related records.',
    'Implement a web-based administrative system that allows administrators to manage users, vehicles, parking zones, parking slots, cameras, parking reservations, sessions, occupancy records, notifications, analytics, violations, appeals, guest admissions, and other parking facility information.',
    'Integrate the mobile application, administrative web application, backend API, vision and OCR service, and database to support the processing, storage, and exchange of parking-related information.',
    'Evaluate PARADA in terms of functionality, reliability, responsiveness, and effectiveness through system testing with IP cameras reading real vehicle license plates.',
  ],
};

// Scope and delimitations (1.0 Introduction; 3.0 Tools and System Requirements; Limitations).
export const SCOPE = {
  covers: [
    'Small to medium-sized facilities: about 50 to 100 spaces across multiple zones',
    'Standard cameras at zone entry and exit gates, with OCR-assisted plate reading',
    'Zone-level availability (capacity − occupied) as the authoritative measure',
    'A mobile app for drivers and a web-based administrative system; two roles, User and Admin',
  ],
  leaves: [
    'Slot-level occupancy: slots are kept for layout, inventory and visual representation only',
    'Motorcycles and other plate formats: camera reading covers four-wheeled vehicles with plates of three letters and three or four digits',
    'Legal enforcement: violations, appeals and fees do not replace institutional parking policies',
    'A public deployment: a demonstration prototype on one computer, not installed in a parking facility',
  ],
};

// 3.0 Methods: the Agile model's six phases (Figure 1), and the development increments in the order the paper lists them.
export const AGILE = ['Requirement analysis', 'Design and prototype', 'Development', 'Quality assurance and testing', 'Deployment', 'Review'];
export const ROADMAP: [string, string, boolean][] = [
  ['0', 'Requirements + architecture', true],
  ['1', 'Project infrastructure', true],
  ['2', 'Database', true],
  ['3', 'Backend foundation', true],
  ['4', 'Authentication + authorization', true],
  ['5', 'Vision/OCR foundation', true],
  ['6', 'Guests, reservations, zone assignment', true],
  ['7', 'Admin web application', true],
  ['8', 'Mobile app + recommendation, reservation, navigation', true],
  ['9', 'Admin overhaul + system-wide audit', true],
  ['10', 'OCR model + physical camera sources', true],
  ['11', 'Real-time updates (SSE)', true],
  ['12', 'Full system integration', true],
  ['13', 'Testing + accuracy evaluation', true],
  ['14', 'Live camera testing', true],
  ['15', 'Deployment to the test environment', true],
  ['16', 'Final documentation', true],
];

// Level 0 Data Flow Diagram (Figure 3): three external entities, one process.
export const CONTEXT = [
  { who: 'Driver · mobile app', gives: 'Account information, vehicle registrations, zone assignment and reservation requests, violation appeals', gets: 'Zone availability and recommendations, assignment and reservation status, directions, session and fee information, notifications, violation and appeal outcomes' },
  { who: 'Gate camera', gives: 'Frames from which the system reads license plates', gets: '' },
  { who: 'Administrator · web console', gives: 'Sign-in, zone, slot and camera configuration, establishment settings, guest admissions, violation and appeal decisions, simulator scenarios', gets: 'Live occupancy, session and reservation records, anomalies, notifications, analytics' },
];

// 4.0 Testing Results and Appendix A.
export const RESULTS = {
  date: 'November 2026',
  hardware: 'Windows 11 laptop, AMD Ryzen 9 270, 15.3 GB, CPU only; two TP-Link VIGI C320I IP cameras over RTSP',
  dataset: '1,250 generated images: 50 plates × 23 conditions (1,150), plus 100 with no plate',
  fields: [
    { label: 'Exact plate reads', value: '87.1%', note: '1,002 of 1,150 synthetic plates, up from 77.4%; 99.5% character accuracy' },
    { label: 'False positives', value: '0 / 100', note: 'no plate reported on any no-plate image' },
    { label: 'Live, night', value: '10 / 10', note: 'real plate, final version, no incorrect plate' },
    { label: 'Live, day', value: '9 / 10', note: 'cameras steady: 4 of 5 entries, 5 of 5 exits, no incorrect plate' },
    { label: 'Gate event → admin screen', value: '0.39 s', note: 'median of 40 events; 95th percentile 0.46 s' },
    { label: 'Automated tests', value: '1,336', note: 'passed, 2 optional live tests skipped (18 Nov 2026)' },
  ],
  strong: 'Clean, lighting and sensor-noise images 100%; angle 99.5%; distance 98.5%; plate layout 98.0%.',
  weak: [
    { cond: 'Partial occlusion (150 images)', value: '33.3%', why: 'misreads fell from 100 to 15; the rest are now rejected' },
    { cond: 'Blur (200 images)', value: '79.0%', why: 'vehicles should slow down at the gate' },
    { cond: 'Live day, cameras held by hand', value: '1 / 10', why: 'connection lost; plate border read as a letter (ICD 6227)' },
    { cond: 'Plate confirmation, live 1080p', value: '11–15 s', why: 'each frame takes 5–6 s on the CPU' },
  ],
  limits: [
    'Live tests used one vehicle, one plate and two cameras in a controlled setting.',
    'The OCR dataset is synthetic: 87.1% describes controlled degradations, not production accuracy.',
    'Tailgating, two cars through a gate together, was not tested.',
    'PARADA was not installed in a parking facility; fees, reservation window and violation rules are defaults.',
  ],
};

// 4.0 User Acceptance Test Results (17 November 2026) and Changes Made After the Test. Three respondents: descriptive only.
export const UAT = {
  date: '17 November 2026',
  respondents: [
    { id: 'D1', role: 'Driver (staff)', tried: 'Mobile', tasks: '3 / 8', mean: '4.22', meaning: 'Strongly agree', sus: '65.0' },
    { id: 'P1', role: 'PFMO staff', tried: 'Console + mobile', tasks: '3 / 11', mean: '3.68', meaning: 'Agree', sus: '40.0' },
    { id: 'M1', role: 'MISD programmer', tried: 'Console + mobile', tasks: '3 / 11', mean: '3.47', meaning: 'Agree', sus: '67.5' },
  ],
  finding: 'All three SUS scores are below the commonly cited average of 68. They agreed most on what the system shows and does, and least on reliability and responsiveness.',
  fixed: [
    'Payments and Fees: session fees listed first, each with its plate; simulator gained a vehicle selector',
    'Plate search ignores case, spaces and dashes and accepts part of a plate',
    'Registration and forms name the field in error, under the field',
  ],
  caveat: 'Fixes verified by automated tests and a developer re-run, not yet by the respondents.',
};

// 5.0 Conclusions, one per objective, and the overall finding.
export const CONCLUSIONS = [
  'Objective 1, achieved in a controlled setting: gate events moved zone counts correctly, duplicates were rejected, and occupancy never left the zone’s bounds.',
  'Objectives 2 and 3, achieved: drivers view, reserve, navigate to and follow their parking; administrators manage the facility and review its records.',
  'Objective 4, achieved: a gate event reaches an administrator’s screen in a median of 0.39 s; a live plate is confirmed in typically 11 to 15 s.',
  'Objective 5, achieved in a controlled setting: 10 of 10 at night and 9 of 10 daytime gate passes, with no incorrect plate. UAT scores sit below 68.',
  'Zone-level occupancy from gate cameras is a practical alternative to per-space sensors: hardware grows with the gates, not the spaces.',
];
export const RECOMMENDATIONS = [
  'Evaluate at an actual gate, with more plates, vehicles and permanently mounted cameras.',
  'Speed up plate reading: crop the plate region before OCR, or use a graphics processor.',
  'Improve difficult conditions with a detector and OCR trained on Philippine plates, and lighting at the gate.',
  'Add online payment through GCash or Maya, confirmed by the server.',
  'Pilot at a real facility with several cameras and users at once.',
  'Repeat the user acceptance test with more drivers and PFMO personnel.',
];

