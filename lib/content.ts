// Single source of truth for every fact on the site. HTML and the 3D scene both read from here.
// Every fact is from the final capstone paper (parada-V2 (1).pdf, November 2026), cited by
// section, figure or table. Quote the paper; never round a measured figure into a better one, and never drop the caveat
// the paper puts next to it. Demo figures (zones, plates, times) are labelled as demo wherever they appear.

export const SITE_URL = 'https://parada.lorenzmalabanan.com';
export const GITHUB_URL = 'https://github.com/E1yWrites/parada';
/** A file in the PARADA repository, for "Source:" links on the docs and legal pages. */
export const repoFile = (path: string) => `${GITHUB_URL}/blob/main/${path}`;
export const EMAIL = 'lorenzlanzmalabanan@lpubatangas.edu.ph';
// Abstract, first paragraph.
export const DESCRIPTION =
  'PARADA is a mobile and web-based smart guided parking system designed for small to medium-sized parking facilities with multiple parking zones. Instead of installing a sensor in every parking space, PARADA uses standard cameras at zone entry and exit gates, together with Optical Character Recognition (OCR)-assisted processing, to record vehicle entries and exits and maintain zone-level occupancy.';

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

// One car through the gates, as the Level 1 DFD's processes 3.0 and 4.0 describe it. `why`: what the paper says each
// stop guarantees.
export const PIPELINE = [
  { id: 'arrive', title: 'Vehicle arrives', body: 'The vehicle reaches the zone’s entry gate.', why: 'No sensor waits in the bay: the devices grow with the number of gates, not the number of spaces.' },
  { id: 'camera', title: 'Gate camera', body: 'A standard IP camera at the gate streams frames to the vision service over RTSP.', why: 'Frames are processed in memory and are not stored.' },
  { id: 'ocr', title: 'Plate reading (OCR)', body: 'The vision service finds the plate region, or reads the whole frame when none is found, and reads the plate with EasyOCR.', why: 'Only Philippine-format plates are kept, sent once read the same way in two of three frames, or once at 0.9 confidence or higher.' },
  { id: 'api', title: 'Backend API', body: 'The plate, its confidence score, the camera and the time reach the backend as an entry event.', why: 'The API verifies the camera’s key and rejects duplicate events; it is the only component that writes to the database.' },
  { id: 'resolve', title: 'Vehicle matching', body: 'The plate is matched against the registered vehicles.', why: 'A reading below 0.5 confidence, or one that matches no single vehicle, is treated as unregistered under the guest policy and recorded as an anomaly.' },
  { id: 'occupancy', title: 'Occupancy + session', body: 'In one transaction the zone’s occupied count rises, the event and an occupancy snapshot are recorded, the session opens and a matching reservation is consumed.', why: 'A database constraint keeps occupancy between zero and the zone’s capacity.' },
  { id: 'clients', title: 'Mobile + admin', body: 'Once the transaction commits, the change is pushed to the mobile app and the admin console over Server-Sent Events.', why: 'Drivers and administrators see the same backend-authoritative state; a gate event reached the admin screen in a median of 0.39 s.' },
  { id: 'exit', title: 'Vehicle exits', body: 'The exit gate camera reads the plate the same way and sends an exit event.', why: 'Leaving is the same read in reverse, through the same rules.' },
  { id: 'fee', title: 'Session closed + fee', body: 'The backend closes the session, records its duration and computes the fee.', why: 'Prototype default: ₱20 for the first two hours, ₱10 for each started hour after; the facility sets its own.' },
] as const;

// The prototype's default fee (3.0 Design and Prototype): ₱20 for the first two hours, ₱10 per started hour after.
export const FEE_RATE = '₱20 first 2 h · ₱10 per started hour after';
export const parkingFee = (minutes: number) => 20 + 10 * Math.max(0, Math.ceil((minutes - 120) / 60));
export const RECEIPT = { plate: DEMO_PLATE, zone: 'A — North parking area', duration: '02:14', rate: FEE_RATE, fee: `₱${parkingFee(2)}` };

// The driver's path through the mobile app (4.0 User Interfaces, Figures 28–49).
export const MOBILE_STEPS = [
  { title: 'Find parking', body: 'Each zone’s live status and free spaces, counted from gate-camera entries and exits, with the least busy zone marked.' },
  { title: 'Choose your zone', body: 'Go to This Zone assigns you a zone without holding a space.' },
  { title: 'Reserve', body: 'Hold one space in a zone, arriving now, in 30 minutes or in 1 hour; the hold lasts a 15-minute arrival window.' },
  { title: 'Get directions', body: 'Directions to the selected zone, so you don’t circle the lot.' },
  { title: 'Track', body: 'The Now screen shows your session, reservation or assigned zone; history, fees and violations stay in the app.' },
];

// The administrative console (4.0 User Interfaces, Figures 9–27).
export const ADMIN_VERBS = [
  { title: 'Monitor', body: 'Occupied against capacity, vehicles parked now, free spaces, enabled cameras, the 24-hour trend.' },
  { title: 'Manage', body: 'Zones, slots, cameras, users, reservations, sessions and establishment settings.' },
  { title: 'Respond', body: 'Anomalies, guest admission, violations and appeals.' },
  { title: 'Analyze', body: 'Occupancy history and analytics: sessions, fee revenue, violations, peak entry hour.' },
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

// ---------- the final defense, in the paper's chapter order ----------

// Title page and Approval Sheet.
export const THESIS = {
  title: 'PARADA: A Mobile and Web-Based Smart Guided Parking System Using OCR-Assisted Cameras for Zone-Based Occupancy Detection',
  kind: 'A Capstone Project',
  degree: 'Bachelor of Science in Information Technology, Specialized in Multimedia Technology',
  school: 'Lyceum of the Philippines University — Batangas',
  date: 'November 2026',
  proponents: ['Albert G. Abrenica III', 'Jade Drix Stiphen P. Atienza', 'Joshua Shadrach O. Cezar', 'Lance Tristan E. Hilario', 'Lorenz Lanz V. Malabanan'],
  adviser: 'Mr. Orland Anne Christian S. De Ocampo, MSIT',
};

// 1.0 Introduction. The paper has no separate statement of the problem: the general problem is the Introduction's own
// sentence, and the points are the main problems named in 3.0 Requirement Analysis plus the camera caveat from 1.0 and the
// gap from the 2.0 synthesis. `answer` is the specific objective that takes each point on.
export const PROBLEM = {
  general:
    'Where parking is mainly handled through manual observation, drivers may not know which areas have available spaces, and parking personnel may have difficulty keeping track of occupied spaces and parking activity.',
  specific: [
    { text: 'The difficulty of locating available parking spaces.', answer: 2 },
    { text: 'Reliance on manual parking monitoring.', answer: 3 },
    { text: 'The cost and maintenance requirements associated with IoT-based parking sensors, which may not be practical in every slot of a small to medium-sized facility.', answer: 1 },
    { text: 'The studies reviewed each address only part of what a facility needs, so drivers and administrators may not see consistent information.', answer: 4 },
    { text: 'Camera-based systems are still affected by their operating conditions: in the CCTV system of Tahir et al. (2023), the lowest accuracy came from a night-time video.', answer: 5 },
  ],
};

// 1.0 Introduction: the scope and delimitations paragraph.
export const SCOPE = {
  covers: [
    'Small to medium-sized facilities: about 50 to 100 spaces across multiple zones',
    'Standard cameras at zone entry and exit gates, with OCR-assisted plate reading',
    'Zone-level availability (capacity − occupied) as the authoritative measure',
    'A mobile app for drivers and a web-based administrative system, on one backend',
  ],
  leaves: [
    'Slot-level occupancy: slots are kept for layout, inventory and visual representation only',
    'Motorcycles and other plate formats: plate reading covers four-wheeled vehicles with three letters followed by three or four digits, though the registration form still lists other vehicle types',
    'Legal enforcement: violations, appeals and fees do not replace institutional parking policies',
    'Deployment: PARADA is a demonstration prototype, not installed in a parking facility and not deployed on a public server',
  ],
};

// Objectives of the Study, verbatim.
export const OBJECTIVES = {
  general:
    'This study aims to develop PARADA, a mobile and web-based smart guided parking system that uses standard cameras and OCR-assisted processing to support gate-based vehicle monitoring, zone-level occupancy detection, parking reservations, user guidance, and administrative management.',
  specific: [
    'Develop a camera-based parking monitoring module that uses OCR-assisted gate-based entry and exit processing and counting to maintain zone-level occupancy records and calculate parking availability based on each zone’s capacity and occupied count.',
    'Develop a mobile application that allows users to view parking zones and availability, make reservations, receive navigation assistance, monitor active parking sessions, manage registered vehicles, receive notifications, and review parking history and parking-related records.',
    'Implement a web-based administrative system that allows administrators to manage users, vehicles, parking zones, parking slots, cameras, parking reservations, sessions, occupancy records, notifications, analytics, anomalies, violations, appeals, guest admissions, and other parking facility information.',
    'Integrate the mobile application, administrative web application, backend API, vision and OCR service, and database to support the processing, storage, and exchange of parking-related information.',
    'Evaluate PARADA in terms of functionality, reliability, responsiveness, and effectiveness based on ISO/IEC 25010, through system testing with IP cameras reading real vehicle license plates and user acceptance testing with drivers and parking facility personnel.',
  ],
};

// 2.0 Smart Parking Systems; IoT-Based Parking Systems and Sensor Scalability.
export const PRIOR = [
  { who: 'Maristela et al. (2024)', where: 'LPU-Batangas Main Campus', how: 'IoT-based parking monitoring: smart sensors determine parking lot occupancy' },
  { who: 'Tambong et al. (2021)', where: 'LPU-Cavite (LPU PARK’n GO)', how: 'Android application that provides real-time parking availability to drivers' },
  { who: 'Dichoso et al. (2022)', where: 'Victory Mall and Market, Tanauan City, Batangas', how: 'Feasibility study of an RFID-based parking management system' },
];

// 2.0 Camera-Based Parking Monitoring and OCR-Assisted Occupancy Detection.
export const CAMERA_WORK = [
  { who: 'Araneta et al. (2025)', text: 'Real-time illegal parking detection with automatic license plate recognition (YOLOv5) in Butuan City.' },
  { who: 'Jose et al. (2024)', text: 'Vision-based security system for vehicle entry monitoring in a residential subdivision: plate recognition with a database, 96.83% accuracy in vehicle detection and classification.' },
  { who: 'Cruz et al. (2024)', text: 'Computer vision for a university parking area: determines whether specific parking slots are occupied.' },
];

// 2.0 Mobile Parking Applications; Web-Based Parking Management, Monitoring, and Analytics. `answer`: the paper's synthesis.
export const APPS = [
  {
    side: 'Mobile applications',
    found: 'They have grown from showing availability to supporting navigation, reservation and fees.',
    cite: 'Fahim et al., 2021 · Ozkaya & Turunc, 2025 · Jakhar et al., 2025 · Zhang et al., 2023 · Magsino et al., 2022',
    answer: 'PARADA brings these functions together in one mobile application, counts active reservations against each zone’s capacity so a zone is not overbooked, and computes fees from the duration of each session.',
  },
  {
    side: 'Web-based management',
    found: 'They can centralize monitoring, analytics and violation handling, but the tools of Ahmadian et al. (2024) and Straßburg et al. (2025) serve administrators only.',
    cite: 'Fahim et al., 2021 · Ozkaya & Turunc, 2025 · Ahmadian et al., 2024 · Straßburg et al., 2025 · Javaheri et al., 2024',
    answer: 'PARADA records wrong-zone entries as facility-defined violations that drivers can appeal, and anomalies such as an exit without a matching entry, so personnel review unusual events instead of silently accepting them.',
  },
];

// 2.0, closing synthesis of Web-Based Parking Management: what the reviewed studies leave open.
export const GAP = {
  rows: [
    { who: 'Maristela et al. (2024) · Tambong et al. (2021)', short: 'each cover one part of the process: one monitors occupancy, the other shows availability to drivers' },
    { who: 'Araneta et al. (2025) · Jose et al. (2024)', short: 'serve enforcement and security rather than parking availability' },
    { who: 'Cruz et al. (2024)', short: 'determines the status of individual slots, not zone occupancy' },
    { who: 'Coching et al. (2025) · Lavanya et al. (2025)', short: 'read plates at entry and exit, but within a digital twin and a gate-access system for a single parking area' },
    { who: 'Ahmadian et al. (2024) · Straßburg et al. (2025)', short: 'serve administrators only' },
  ],
  statement:
    'The studies reviewed each address only part of what a facility needs. PARADA combines gate-camera plate reading, zone-level occupancy, a driver mobile application, and a web-based administrative system on a single backend that is the only authority on occupancy, sessions, fees, and violations, so that drivers and administrators always see consistent information.',
};

// 3.0 Agile Model (Figure 1): the six phases, and the development increments in the order the paper lists them (the
// system-wide audit is the paper's "Phase 10.1", so the roadmap is numbered from 1).
export const AGILE = ['Requirement analysis', 'Design and prototype', 'Development', 'Quality assurance and testing', 'Deployment', 'Review'];
export const ROADMAP: [string, string][] = [
  ['1', 'Requirements + architecture'],
  ['2', 'Project infrastructure'],
  ['3', 'Database'],
  ['4', 'Backend foundation'],
  ['5', 'Authentication + authorization'],
  ['6', 'Vision/OCR foundation'],
  ['7', 'Guest admission, reservations, zone assignment'],
  ['8', 'Admin web application'],
  ['9', 'Mobile app + recommendation, reservation, navigation'],
  ['10', 'Admin overhaul + system-wide audit'],
  ['11', 'OCR model + physical camera sources'],
  ['12', 'Real-time updates (SSE)'],
  ['13', 'Full system integration'],
  ['14', 'Testing + accuracy evaluation'],
  ['15', 'Live camera testing'],
  ['16', 'Deployment: prepared and run in the test environment'],
  ['17', 'Final documentation'],
];

// Gantt Chart (Figure 2) and 3.0 Design and Prototype: [when, what].
export const TIMELINE: [string, string][] = [
  ['23 Apr 2026', 'Oral defense (requirement analysis)'],
  ['May 2026', 'Consultation and revision'],
  ['29 Aug – 4 Sep', 'First commit; architecture and database designed first'],
  ['30 Aug – 1 Sep', 'First admin prototype built, then reverted: its interface and the data simulator did not work properly'],
  ['2 Sep', 'First mobile application'],
  ['14 – 20 Sep', 'Both interfaces redesigned around the “Gate Pass” visual identity'],
  ['26 Sep', 'Design audit (mobile 10/30, admin 11/30) and redesign of both apps'],
  ['16 Nov 2026', 'Last commit; latest full automated test run'],
  ['17 Nov 2026', 'User acceptance test'],
  ['18 Nov 2026', 'Failed tasks corrected; test suites and a developer check re-run'],
];

// Privacy and security, as the paper states them: 3.0 Design and Prototype, Deployment Phase, Evaluation Design; 2.0 Video
// Analytics (Ardabili et al., 2023). The paper has no separate ethics section.
export const ETHICS = {
  law: 'Camera frames are processed in memory and not stored, which limits the privacy concerns Ardabili et al. (2023) describe; the user acceptance test followed the Data Privacy Act of 2012 (Republic Act No. 10173)',
  points: [
    'Camera frames and raw OCR output are not stored; each plate reading is kept on its occupancy event together with its confidence score.',
    'The administrator’s session token is kept in a secure HttpOnly cookie behind a server-side proxy and is never exposed to the browser.',
    'Passwords are hashed with Argon2; sessions use JSON Web Tokens; password-reset links and verification codes work once and expire.',
    'Production configuration refuses to start without a camera API key; a threat model and release checks were prepared, and the database integrity constraints are verified after each migration.',
    'Violations and fines are facility house rules recorded within the system; they do not replace institutional parking policies or legal enforcement procedures.',
    'Test data came from test accounts and a researcher’s own plate; the user acceptance test was voluntary and anonymous, with the respondent’s consent.',
  ],
};

// 4.0 Level 0 Data Flow Diagram (Figure 3): three external entities, one process.
export const CONTEXT = [
  { who: 'Driver · mobile app', gives: 'Account information, vehicle registrations, zone assignment and reservation requests, violation appeals', gets: 'Zone availability and recommendations, assignment and reservation status, directions, session and fee information, notifications, violation and appeal outcomes' },
  { who: 'Gate camera', gives: 'Frames from which the system reads license plates', gets: '' },
  { who: 'Administrator · web console', gives: 'Sign-in, zone, slot and camera configuration, establishment settings, guest admissions, violation and appeal decisions, simulator scenarios', gets: 'Live occupancy, session and reservation records, anomalies, notifications, analytics' },
];

// 4.0 Level 1 Data Flow Diagram (Figures 4–5): seven processes.
export const PROCESSES: [string, string, string][] = [
  ['1.0', 'Authenticate and manage accounts', 'Registration with email verification, sign-in, password recovery, profile and vehicle registration'],
  ['2.0', 'Configure facility', 'Zones, slots, gate cameras and establishment settings'],
  ['3.0', 'Read license plates', 'Vision service: plate region or whole frame, OCR, Philippine format, two of three frames or 0.9 confidence'],
  ['4.0', 'Process gate events', 'Backend, in one transaction: occupancy, event and snapshot, session, fee, reservation, anomalies or wrong-zone violations'],
  ['5.0', 'Guide and reserve', 'Recommends the least-occupied zone, records assignments and reservations against capacity, gives directions'],
  ['6.0', 'Sessions, fees, violations, appeals', 'Driver history, fees and appeals; admin guest admission and decisions'],
  ['7.0', 'Monitor, notify and analyze', 'Notifications, anomalies, occupancy history and analytics, real-time push to both apps'],
];

// 4.0 Use Case Diagram (Figure 6): three actors.
export const USE_CASES = [
  { who: 'Driver', via: 'Mobile application', does: ['Register, verify email, sign in', 'Manage vehicles', 'View zone availability', 'Reserve or commit to a zone', 'Get directions', 'Review sessions, fees and history', 'View violations, file an appeal', 'Receive notifications'] },
  { who: 'Administrator', via: 'Web console', does: ['Manage zones, slots and cameras', 'Manage users and reservations', 'Monitor occupancy and analytics', 'Review anomalies', 'Decide violations and appeals', 'Admit guest vehicles', 'Run the data simulator', 'Configure establishment settings'] },
  { who: 'Gate camera + vision service', via: 'System actor', does: ['Capture a frame at a gate', 'Read the plate with OCR', 'Report an entry or exit event'] },
];

// 4.0 Entity Relationship Diagram (Figure 8) and 3.0 Design and Prototype.
export const ERD = {
  entities: ['Users', 'Vehicles', 'Parking zones', 'Parking slots', 'Cameras', 'Occupancy events', 'Occupancy anomalies', 'Occupancy history', 'Parking sessions', 'Guest sessions', 'Parking fees', 'Reservations', 'Zone assignments', 'Violations', 'Violation appeals', 'Notifications', 'Establishment configuration', 'Revoked tokens'],
  rules: [
    'A zone’s occupied count stays between zero and its capacity',
    'Only one parking session can be active at a time',
    'Only one zone assignment can be active at a time',
    'Only one registration of a plate can be active at a time',
  ],
};

// 4.0 Testing Results and Appendix A. Live tests on the hardware in 3.0 Tools and System Requirements.
export const RESULTS = {
  date: 'November 2026',
  hardware: 'Windows 11 laptop, AMD Ryzen 9 270, 15.3 GB, CPU only; two TP-Link VIGI C320I IP cameras over RTSP on a PoE switch',
  dataset: '1,250 generated images: 50 plates × 23 conditions (1,150), plus 100 with no plate',
  fields: [
    { label: 'Exact plate reads', value: '87.1%', note: '1,002 of 1,150 synthetic plates, up from 77.4%; 99.5% character accuracy' },
    { label: 'False positives', value: '0 / 100', note: 'no plate reported on any no-plate image' },
    { label: 'Live, night', value: '10 / 10', note: 'real plate, final version, no incorrect plate' },
    { label: 'Live, day', value: '9 / 10', note: 'cameras steady: 4 of 5 entries, 5 of 5 exits, no incorrect plate' },
    { label: 'Gate event → admin screen', value: '0.39 s', note: 'median of 40 events; 95th percentile 0.46 s' },
    { label: 'Automated tests', value: '1,239', note: 'passed in the latest full run, 2 optional live tests skipped (16 Nov 2026)' },
  ],
};

// Table 1: automated test results by workspace (latest full run, 16 November 2026).
export const TESTS: [string, string, string, string][] = [
  ['Mobile application', '39', '490', '0'],
  ['Backend API', '18', '310', '0'],
  ['Administrative web application', '22', '157', '0'],
  ['Vision and OCR service', '–', '220', '2'],
  ['Database', '1', '53', '0'],
  ['Shared types', '1', '9', '0'],
];

// Table 2: exact-match plate accuracy by condition group.
export const ACCURACY = {
  rows: [
    ['Clean', '50', '100%'],
    ['Lighting', '200', '100%'],
    ['Sensor noise', '50', '100%'],
    ['Angle', '200', '99.5%'],
    ['Distance', '200', '98.5%'],
    ['Plate layout', '100', '98.0%'],
    ['Blur', '200', '79.0%'],
    ['Partial occlusion', '150', '33.3%'],
  ] as [string, string, string][],
  total: ['All plate images', '1,150', '87.1%'] as [string, string, string],
  outcomes: 'Of all 1,150 plate images: 2.3% no detection, 2.4% misread, 8.2% read but rejected as not a complete Philippine plate.',
  gain: 'Most of the gain over 77.4% came from the plate-format check and the whole-frame fallback; the median time per image rose from 81.7 ms to 174 ms.',
  safety: 'A misread cannot open a session for the wrong vehicle: a low-confidence or unmatched reading is treated as unregistered and recorded as an anomaly.',
};

// Table 3: live camera test rounds, in the order they were run, on a researcher's own plate (Appendix A).
export const LIVE = {
  plate: 'CDI 6227',
  rounds: [
    ['Night, infrared · 10 presentations', 'First', '0 of 10 (3 recorded)', '3'],
    ['Night, better lighting · 10', 'Revised', '9 of 10, about 15 s', '3 (CDG 227)'],
    ['Day, two rounds · 10 each', 'Intermediate', '6 and 7 of 10', '0'],
    ['Night · 10 presentations', 'Final', '10 of 10, about 11 s (6.6–16.2 s)', '0'],
    ['Day, cameras held by hand · 5 cycles', 'Final', 'Entries 1 of 5, exits 0 of 5', '1 (ICD 6227)'],
    ['Day, cameras steady on a table · 5 cycles', 'Final', 'Entries 4 of 5, exits 5 of 5, 7–22 s', '0'],
  ] as [string, string, string, string][],
  revisions: 'Between rounds: characters no longer move between the letter and number groups, letter groups split by the OCR are joined, and a vehicle is counted once while it stays in view.',
  missed: 'With the cameras steady, the one missed entry was the plate’s border read as an extra letter (ICDI 6227), which the plate-format check rejects.',
  lesson: 'Steady mounting mattered as much as the software.',
};

// Table 4: time per stage over 40 gate events (milliseconds), plus the live-camera timing.
export const SPEED = {
  rows: [
    ['Plate detection and OCR (vision service)', '85.4', '90.7'],
    ['Event processing and database transaction (API)', '15.6', '22.0'],
    ['Vision service to database', '375.1', '411.7'],
    ['Vision service to the administrator’s screen', '391.0', '464.2'],
  ] as [string, string, string][],
  delivered: 'All 40 events were accepted, read correctly and delivered.',
  localhost: 'Addressing the API as “localhost” added about 2 s per event, because the name first resolved to IPv6; the default became 127.0.0.1.',
  live: 'With live 1080p cameras each frame took about 5–6 s on the CPU, so a plate was confirmed about 7–29 s after it was presented, averaging 11–15 s.',
};

// 4.0 User Acceptance Test Results (17 November 2026), Tables 5–8, and Changes Made After the Test.
export const UAT = {
  date: '17 November 2026',
  respondents: [
    { id: 'D1', role: 'Driver (staff)', tried: 'Mobile', tasks: '3 / 8', mean: '4.22', meaning: 'Strongly agree', sus: '65.0' },
    { id: 'P1', role: 'PFMO staff', tried: 'Console + mobile', tasks: '3 / 11', mean: '3.68', meaning: 'Agree', sus: '40.0' },
    { id: 'M1', role: 'MISD programmer', tried: 'Console + mobile', tasks: '3 / 11', mean: '3.47', meaning: 'Agree', sus: '67.5' },
  ],
  finding: 'All three SUS scores are below the commonly cited average of 68 (Sauro, 2011). Not completed by anyone who tried them: reading the fee in Payments and Fees (all three), and finding a vehicle by its plate in Parking Sessions (both administrative respondents). The driver also did not complete the Violations task.',
  fixed: [
    'Payments and Fees: session fees listed first, each with its plate; simulator gained a vehicle selector',
    'Plate search ignores case, spaces and dashes and accepts part of a plate',
    'Registration and forms name the field in error, under the field, with the password rule shown before typing',
    'Creating or editing a zone with an existing name or code returns a conflict that names the field',
  ],
  remaining: [
    'The verification code is printed to the API console unless an email service is configured',
    'The session search covers only the latest 200 sessions and cannot find guest plates',
    'The Violations task the driver did not complete was not investigated',
  ],
  caveat: 'Corrections verified by automated tests and a developer check on 18 Nov 2026, not by the respondents.',
  // Table 7: mean rating by quality characteristic (ISO/IEC 25010 basis; 1–5 scale).
  quality: [
    ['Functionality', '4.20 A', '4.60 SA', '3.80 A'],
    ['Reliability', '3.33 N', '3.25 N', '3.00 N'],
    ['Responsiveness', '4.33 SA', '3.25 N', '3.00 N'],
    ['Effectiveness', '4.40 SA', '3.50 A', '3.83 A'],
    ['Trust (driver form only)', '5.00 SA', '–', '–'],
    ['Overall', '4.22 SA', '3.68 A', '3.47 A'],
  ] as [string, string, string, string][],
  scale: 'SA Strongly agree (4.21–5.00) · A Agree (3.41–4.20) · N Neutral (2.61–3.40). The two forms differ, so driver and staff means are not directly comparable.',
  // Appendix C.4, quoted as written.
  comments: [
    { who: 'D1', said: 'The design and idea of the system' },
    { who: 'M1', said: 'The design for the Admin and user-side is good and concise.' },
    { who: 'P1', said: 'THE REGISTRATION', improve: true },
    { who: 'D1', said: 'The user registration should be improved if it will be deployed in a private space.', improve: true },
    { who: 'M1', said: 'Form validations could be improved as well to highlight the specific fields with errors.', improve: true },
  ],
};

// 4.0 Discussion: Limitations, and Compared with Sensor-Based Systems.
export const LIMITS = {
  testing: [
    'The live tests used one vehicle, one plate and two cameras in a controlled setting, with a few rounds per condition.',
    'The OCR dataset is synthetic and generated by the researchers: 87.1% describes controlled degradations, not production accuracy.',
    'Plate confirmation takes about 11 to 15 seconds.',
    'Tailgating, two cars passing a gate together, was not tested.',
    'Cost was not measured or compared side by side with sensor systems, so “fewer devices” remains a design argument.',
  ],
  scope: [
    'Plate reading covers four-wheeled vehicles with three letters and three or four digits; motorcycles and other formats are not covered.',
    'PARADA was not installed in a parking facility; its fees, reservation window and violation rules are defaults a facility would set.',
    'The UAT had three respondents chosen by the researchers (one driver, one PFMO staff member, one MISD programmer); its means and SUS scores cannot be generalized or tested statistically, the two forms contain different statements, and its gate-entry tasks used simulated events.',
    'Corrections made after the UAT were checked by automated tests, not by users.',
  ],
};

// 5.0 Conclusions, one per objective, then the overall conclusion.
export const CONCLUSIONS = [
  { obj: '1', what: 'Camera-based monitoring', verdict: 'Achieved within a controlled setting', text: 'Gate events from the vision service moved zone occupancy correctly, duplicates were rejected, and occupancy never left the zone’s bounds. On a synthetic dataset, 99.5% to 100% exact reads for clean, lighting, noise and moderate-angle images and 87.1% across all conditions, with no plate reported on images that had none. Live: 10 of 10 at night and 9 of 10 daytime gate passes with steady cameras, no incorrect plate.' },
  { obj: '2', what: 'Mobile application', verdict: 'Achieved', text: 'Drivers view zones and live availability, commit to or reserve a zone, get directions, follow their current parking, and review history, vehicles, notifications, fees, violations and appeals.' },
  { obj: '3', what: 'Administrative system', verdict: 'Achieved', text: 'Administrators manage zones, slots, cameras, users, reservations and sessions, and review occupancy history, analytics, notifications, anomalies, violations, appeals and guest admissions.' },
  { obj: '4', what: 'Integration', verdict: 'Achieved', text: 'All components exchanged data through the backend. In a timing test on synthetic images a gate event reached an administrator’s screen in a median of 0.39 s; with live 1080p IP cameras a plate was confirmed typically 11 to 15 s after it was presented, mainly because each frame took about 5 to 6 s to process.' },
  { obj: '5', what: 'Evaluation', verdict: 'Achieved within a controlled setting', text: 'Live, the final version read the plate in 10 of 10 night presentations and recorded 4 of 5 entries and 5 of 5 exits by day, with no incorrect plate; main limits: a typical 11 to 15 s response, one vehicle, and the plate border sometimes read as an extra letter. UAT means 4.22 (Strongly agree), 3.68 and 3.47 (Agree); SUS 65.0, 40.0 and 67.5, all below 68. The Payments and Fees and plate-search tasks were not completed, and all three commented on registration or forms; the failed tasks were corrected and verified by automated tests, not by users.' },
];
export const OVERALL =
  'Zone-level occupancy maintained from gate cameras is a practical alternative to per-space sensors for a small to medium-sized facility, with hardware that grows with the number of gates rather than the number of parking spaces.';

// 5.0 Recommendations in the paper's order and with its headings.
export const RECOMMENDATIONS = [
  { title: 'Evaluate at an actual gate', text: 'Test the final plate-reading pipeline with more plates and vehicles, cameras permanently mounted at a gate, and longer periods before relying on plate identity in daily operation.' },
  { title: 'Speed up plate reading', text: 'Crop the plate region before OCR, or use a graphics processor, to cut the 5–6 s per frame so moving vehicles are read more often.' },
  { title: 'Improve reading in difficult conditions', text: 'Partial occlusion (33.3%) and blur (79.0%) were the weakest synthetic conditions, and night-time infrared caused the most live misreads. A detector and OCR model trained on Philippine plates, with added lighting at the gate, may help.' },
  { title: 'Mount cameras for the detector', text: 'Position gate cameras so plates fall within the tested size range, and vehicles slow down at the gate to avoid motion blur.' },
  { title: 'Add online payment', text: 'Integrate a local channel such as GCash or Maya, with confirmations verified by the server, so fees and fines can be settled in the app.' },
  { title: 'Deploy at a pilot facility', text: 'Run PARADA at an actual parking facility, with persistent connections from the vision service to the API and several cameras and users at the same time.' },
  { title: 'Extend to more facilities', text: 'Test larger or multi-level facilities and compare zone-level counting against per-space sensing on cost and accuracy.' },
  { title: 'Test the corrections with users', text: 'Repeat the user acceptance test with more drivers and PFMO personnel on the registration, Payments and Fees, and plate-search tasks.' },
  { title: 'Complete the remaining fixes', text: 'Configure an email service so verification codes reach users, search sessions on the server so guest plates and older sessions can be found, and investigate the Violations task. The rules on who may register are left to the facility that adopts PARADA.' },
];
