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

- Facts live in `lib/content.ts`. Product figures come from the live site: zones A 18/30, B 42/50, C 15/40 (120 capacity); the 9-step pipeline; the demo plate ABC 1234; the demo receipt (02:14, rate configured, fee calculated). Defense facts come from the capstone paper (PARADA.pdf, May 2026: cover title, proponents, Introduction, Objectives verbatim, Literature Review citations, Methods, Level 0 DFD, Appendix A interview) and the app repo's Phase 14 evaluation (`docs/vision/phase14-evaluation.md`, 2026-09-14: 77.4% exact plate reads, 93.8% character accuracy, 0/100 false positives, 391 ms median plate read → admin update, 801 automated tests; synthetic dataset, stated on the slide). The paper is slightly behind the built system, so where they differ the system (github.com/E1yWrites/parada: README, docs/architecture/roadmap.md) is the source of truth: scope (gate-based counting, 50–100 spaces, zone-level authority, two roles), development (the 0–16 phase roadmap, 0–14 done) and data flow come from the repo; the title is the paper's cover title. The paper's Statement of the Problem lives inside its Introduction; the deck sets it out as its own slide without adding to it, and does not invent UAT results.
- Zone-level only. Do not claim slot locking, EV filters, extensions, pricing figures, users or deployments.
- Project status is honest: a capstone in development.
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
- The capstone paper (PARADA.pdf, May 2026) and the Phase 14 evaluation in the app repo.
- Absent: real app screenshots of the driver app or dashboard (the paper's Figma figures are prototypes, not used), UAT results, testimonials, pricing. Do not fabricate them.

## Product Principles

1. Show the mechanism, don't describe it: the trip through the gates is the explanation.
2. Every number on screen matches `lib/content.ts`.
3. The 3D layer enhances the site and never gates it.
4. Zone over slot, everywhere.

## Accessibility & Inclusion

Keyboard and touch controls for the game; every fact also in HTML; reduced-motion respected; text contrast at WCAG AA.
