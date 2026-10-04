# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** prospective users and stakeholders of LPU-Batangas (drivers, administrators, school decision-makers) who land on the project site and need to understand, in seconds, what PARADA does and why it beats circling the lot.
- **Secondary:** the BSIT capstone panel evaluating the project. They read the separate Technical tab (architecture, stack, security, status, journey) and expect every fact to be accurate.

## Product Purpose

PARADA is a mobile and web-based smart parking management system for LPU-Batangas. It uses zone-gate cameras, computer vision and OCR on license plates, and zone-based occupancy monitoring. Drivers see live zone availability, reserve, navigate and track their session on mobile; administrators monitor zones, cameras, sessions and activity on a web dashboard. Success for this site: a visitor watches or plays one vehicle's trip from the entry gate to the exit gate and leaves understanding the pipeline.

## Positioning

The zone is the authoritative unit, not the individual slot. Cameras at zone gates read plates as vehicles pass, and one backend transaction updates zone occupancy and the parking session. Both clients read the same backend-authoritative state.

## Operating Context

- The real campus is the setting: LPU-Batangas main campus (13.7638 N, 121.0653 E), modelled from OpenStreetMap footprints and satellite imagery, with Kenney City Builder street tiles and buildings for the surroundings. Zone logic follows the PARADA app: every zone is enclosed and its count changes only at its gate cameras (bays are layout only). Zone A is the one-way Main Loop round the JPL Building, entry camera at the curved main-gate canopy on the north-west corner, exit camera at the north gate on Doña Aurelia St. Zones B (east lot, carport) and C (the real south parking area) are the landing's demo zones, fenced, one bidirectional camera each. Reference photos m1–m8: main gate canopy with stone pillars, tree avenue with perpendicular parking, carports, yellow kerbs, the north-gate road between buildings.
- The site replaces parada-landing.vercel.app and must work as a real website: crawlable HTML for every fact, usable on phones and without WebGL.

## Capabilities and Constraints

- Facts live in `lib/content.ts` and come only from the live site: zones A 18/30, B 42/50, C 15/40 (120 capacity); the 9-step pipeline; the demo plate ABC 1234; the demo receipt (02:14, rate configured, fee calculated).
- Zone-level only. Do not claim slot locking, EV filters, extensions, pricing figures, users or deployments.
- Project status is honest: a capstone in development.
- Stack: Next.js (static export), React Three Fiber, drei, GSAP ScrollTrigger, Web Audio synthesized sound (opt-in).
- Performance: 60fps target, DPR ≤ 2, a simpler mobile scene without shadows, reduced motion means no scroll-scrubbed camera, no layout shift, Lighthouse ≥ 80 on desktop.

## Brand Commitments

- Name: PARADA. Affiliation: Lyceum of the Philippines University — Batangas, BSIT capstone.
- Marketing comes first on the home (Experience) tab; technical and panel material sits in a separate Technical tab.
- Game-like and controllable, with sound. The user drives one car: entry gate → plate read → park in a zone → exit gate → receipt, with a Registered or Guest plate toggle.
- Campus modelled on the LPU-Batangas photos; building shapes may be stylised.

## Evidence on Hand

- Copy and figures: `lib/content.ts`, `public/llms.txt`.
- Campus reference photos (8, HEIC converted to JPG).
- Absent: real app screenshots, testimonials, metrics, pricing. Do not fabricate them.

## Product Principles

1. Show the mechanism, don't describe it: the trip through the gates is the explanation.
2. Every number on screen matches `lib/content.ts`.
3. The 3D layer enhances the site and never gates it.
4. Zone over slot, everywhere.

## Accessibility & Inclusion

Keyboard and touch controls for the game; every fact also in HTML; reduced-motion respected; text contrast at WCAG AA.
