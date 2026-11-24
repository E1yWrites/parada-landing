# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (through the final defense):** the BSIT capstone panel. The home tab is the defense deck, presented on a laptop to a TV or projector with a clicker. They expect the problem, the reasoning that led to the solution, the paper's objectives word for word, and every figure accurate.
- **Secondary:** prospective users and stakeholders of LPU-Batangas (drivers, administrators, school decision-makers), who get PARADA at a glance in the four sideways panels and can drive the trip themselves. The Technical tab (architecture, stack, security, status, journey) serves both.

## Product Purpose

PARADA is a mobile and web-based smart parking management system for LPU-Batangas. It uses zone-gate cameras, computer vision and OCR on license plates, and zone-based occupancy monitoring. Drivers see live zone availability, reserve, navigate and track their session on mobile; administrators monitor zones, cameras, sessions and activity on a web dashboard. Success for this site: a visitor watches or plays one vehicle's trip from the entry gate to the exit gate and leaves understanding the pipeline.

## Positioning

The zone is the authoritative unit, not the individual slot. Cameras at zone gates read plates as vehicles pass, and one backend transaction updates zone occupancy and the parking session. Both clients read the same backend-authoritative state.

## Operating Context

- The real campus is the setting: LPU-Batangas main campus (13.7638 N, 121.0653 E). Building footprints are traced from satellite imagery and checked against the team's marked-up map; the campus edge and the neighbourhood houses come from OpenStreetMap. Building names and the smaller structures (LSSC, Power House, GenSet and HVSG rooms, staff houses, water tanks) follow the official LPU-B Main Campus map, legend numbers kept in the block names. Every building is custom-modelled (no kit blocks); the gymnasium and the chapel follow LPU-B's facilities photos. No 3D model of LPU-B exists anywhere to reuse, and Google's photorealistic tiles neither cover Batangas City nor may be traced. Zone logic follows the PARADA app: a zone's count changes only at its gate cameras (bays are layout only). Only Zone A is modelled in 3D: the one-way Main Loop round the JPL Building, entry camera at the curved main-gate canopy on the north-west corner, exit camera at the north gate on Doña Aurelia St. Zones B and C appear as numbers in the page and the HUD. Reference photos m1–m8: main gate canopy with stone pillars, tree avenue with perpendicular parking, carports, yellow kerbs, the north-gate road between buildings.
- The site replaces parada-landing.vercel.app and must work as a real website: crawlable HTML for every fact, usable on phones and without WebGL.
- Docs and Legal (terms, privacy, licences) are summarised from the PARADA repository's README and `docs/`, each section naming its source file. PARADA is not deployed, so the privacy notice describes this site plus what the system is built to process; the establishment that deploys it is the controller and owes drivers its own notice. Do not add legal commitments the repository doesn't support.

## Capabilities and Constraints

- Facts live in `lib/content.ts`. Demo figures stay inside the paper's scope (about 50–100 spaces): zones A 18/30, B 34/40 (under the 20% low-availability threshold), C 12/30, 100 capacity; demo plate ABC 1234; demo receipt 02:14 at the prototype's default fee (₱20). The nine-step trip follows the Level 1 DFD's processes 3.0 and 4.0. The deck follows the paper's chapter order 1:1, and every slide names its section, figure or table. The live test plate (CDI 6227) is a researcher's own vehicle and is shown with its misreads, as in the paper. The prototype will not be deployed: the deck leaves out the paper's Agile Deployment phase, the test-environment deployment step and the pilot-facility recommendation, and says so on the scope slide. Defense facts come from the final capstone paper (PARADA-Final-Capstone-Paper-FINAL-v21.pdf, November 2026: cover, adviser, Introduction, the five Objectives verbatim, Literature Review citations, 3.0 Methods (Agile phases, development increments, Gantt chart), Level 0 DFD, 4.0 Testing Results and User Acceptance Test, 5.0 Conclusions and Recommendations, Appendix A). Headline figures: 87.1% exact plate reads (1,002/1,150 synthetic, up from 77.4%), 99.5% character accuracy, 0/100 false positives, live IP-camera tests 10/10 at night and 9/10 by day with steady cameras, 0.39 s median gate event → admin screen, 1,336 automated tests; UAT with three respondents (means 4.22, 3.68, 3.47; SUS 65.0, 40.0, 67.5, all below 68). The paper is newer than the app repo's roadmap, so the paper wins where they differ. Every figure keeps the caveat the paper puts beside it (synthetic dataset, controlled setting, three respondents, fixes verified by tests not users). The paper has no separate Statement of the Problem; the deck builds it from the Introduction, Research Gap and Requirement Analysis without adding to them. The PDF itself is not committed: it carries the team's phone numbers and CVs.
- Zone-level only. Do not claim slot locking, EV filters, extensions, pricing figures, users or deployments.
- Project status is honest: a demonstration prototype, tested in a controlled setting, not installed in a parking facility and not deployed on a public server.
- Stack: Next.js (static export), React Three Fiber, drei, GSAP ScrollTrigger, Web Audio synthesized sound (opt-in).
- Performance: 60fps target, DPR ≤ 2, a simpler mobile scene without shadows, reduced motion means no scroll-scrubbed camera, no layout shift, Lighthouse ≥ 80 on desktop.

## Brand Commitments

- Name: PARADA. Affiliation: Lyceum of the Philippines University — Batangas, BSIT capstone.
- The home (Experience) tab is the final-defense deck: the title slide, PARADA at a glance in four sideways panels, then the defense, problem first. The Technical tab keeps the full technical material.
- Game-like and controllable, with sound. The user drives one car: entry gate → plate read → park in a zone → exit gate → receipt, with a Registered or Guest plate toggle.
- Campus modelled on the LPU-Batangas photos; building shapes may be stylised.

## Evidence on Hand

- Copy and figures: `lib/content.ts`, `public/llms.txt`.
- Campus reference photos (8, HEIC converted to JPG).
- Brand assets from the app repo (E1yWrites/parada): the PARADA logo, P mark, guard-dog mascot and the app's tagline "Guiding every vehicle to its zone." (admin sign-in screen).
- The final capstone paper (`parada-V2 (1).pdf`, November 2026), including UAT results and the prototype's default fee (₱20 first two hours, ₱10 per started hour after).
- Absent: real app screenshots on the site (the paper's Figures 9–49 are real screenshots but are not yet exported), testimonials. Do not fabricate them.

## Product Principles

1. Show the mechanism, don't describe it: the trip through the gates is the explanation.
2. Every number on screen matches `lib/content.ts`.
3. The 3D layer enhances the site and never gates it.
4. Zone over slot, everywhere.

## Accessibility & Inclusion

Keyboard and touch controls for the game; every fact also in HTML; reduced-motion respected; text contrast at WCAG AA.
