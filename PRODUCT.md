# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** the people who would bring PARADA to their campus or parking site: school administrators, campus security heads, facility and parking managers. They want to know, in plain words and in under a minute, what PARADA does, what it would change, whether it works, and how to start a pilot. Not technical, and not a thesis panel.
- **Secondary:** drivers (students, staff, visitors), who meet PARADA as the benefit the site gets, and the curious, who take the 3D demo (/demo/). The Technical and Legal tabs keep the technical material; the documentation itself lives with the code on GitHub (the last nav tab).

## Product Purpose

PARADA is a mobile and web-based smart parking management system for LPU-Batangas. It uses zone-gate cameras, computer vision and OCR on license plates, and zone-based occupancy monitoring. Drivers see live zone availability, reserve, navigate and track their session on mobile; administrators monitor zones, cameras, sessions and activity on a web dashboard. Success for this site: a decision-maker understands what PARADA would do for their site and emails the team about a pilot; on the demo, a visitor watches or drives one vehicle's trip from the entry gate to the exit gate.

## Positioning

The zone is the authoritative unit, not the individual slot. Cameras at zone gates read plates as vehicles pass, and one backend transaction updates zone occupancy and the parking session. Both clients read the same backend-authoritative state.

## Operating Context

- The real campus is the setting: LPU-Batangas main campus (13.7638 N, 121.0653 E). Building footprints are traced from satellite imagery and checked against the team's marked-up map; the campus edge and the neighbourhood houses come from OpenStreetMap. Building names and the smaller structures (LSSC, Power House, GenSet and HVSG rooms, staff houses, water tanks) follow the official LPU-B Main Campus map, legend numbers kept in the block names. Every building is custom-modelled (no kit blocks); the gymnasium and the chapel follow LPU-B's facilities photos. No 3D model of LPU-B exists anywhere to reuse, and Google's photorealistic tiles neither cover Batangas City nor may be traced. Zone logic follows the PARADA app: a zone's count changes only at its gate cameras (bays are layout only). Only Zone A is modelled in 3D: the one-way Main Loop round the JPL Building, entry camera at the curved main-gate canopy on the north-west corner, exit camera at the north gate on Doña Aurelia St. Zones B and C appear as numbers in the page and the HUD. Reference photos m1–m8: main gate canopy with stone pillars, tree avenue with perpendicular parking, carports, yellow kerbs, the north-gate road between buildings.
- The site replaces parada-landing.vercel.app and must work as a real website: crawlable HTML for every fact, usable on phones and without WebGL. The landing page (/) never downloads the 3D campus.
- Legal (terms, privacy, licences) is summarised from the PARADA repository's README and `docs/`, each section naming its source file. PARADA is not deployed, so the privacy notice describes this site plus what the system is built to process; the establishment that deploys it is the controller and owes drivers its own notice. Do not add legal commitments the repository doesn't support.

## Capabilities and Constraints

- Facts live in `lib/content.ts`, written for non-technical readers: no protocol, library or process names on `/` or `/demo/`. Demo figures stay inside the paper's scope (about 50–100 spaces): zones A 18/30, B 34/40 (under the 20% low-availability threshold), C 12/30, 100 capacity; demo plate ABC 1234; demo receipt 02:14 at the prototype's default fee (₱20), always labelled as demo. The nine-stop demo trip follows the Level 1 DFD's processes 3.0 and 4.0. Figures come from the final capstone paper (v21, November 2026) and keep the caveat the paper puts beside them, in plain words: 87.1% exact plate reads (1,002/1,150 generated images, 23 conditions), live IP-camera tests 10/10 at night and 9/10 by day with steady cameras, 0.39 s median gate event → admin screen (40 events). The paper is newer than the app repo's roadmap, so the paper wins where they differ. The PDF itself is not committed: it carries the team's phone numbers and CVs. The final-defense deck that used to be the home page was removed (November 2026); it is in git history.
- Zone-level only. Do not claim slot locking, EV filters, extensions, pricing figures, users or deployments.
- Project status is honest: a working prototype, tested in a controlled setting, not yet installed at a parking site. The team is ready to pilot it and says so; the contact is the team's LPU address in `EMAIL`.
- Stack: Next.js (static export), React Three Fiber, drei, GSAP ScrollTrigger, Web Audio synthesized sound (opt-in).
- Performance: 60fps target, DPR ≤ 2, a simpler mobile scene without shadows, reduced motion means no scroll-scrubbed camera, no layout shift, Lighthouse ≥ 80 on desktop.

## Brand Commitments

- Name: PARADA. Tagline: "Guiding every vehicle to its zone." (the app's admin sign-in screen). Built at Lyceum of the Philippines University — Batangas.
- Home (/) is the customer landing page: what it does, the problem, how it works in three stops, the two screens, proof and the pilot ask. Demo (/demo/) is the 3D campus with the guided trip and drive mode. The Technical tab keeps the full technical material.
- The demo is game-like and controllable, with sound. The user drives one car: entry gate → plate read → park in a zone → exit gate → receipt, with a Registered or Guest plate toggle.
- Campus modelled on the LPU-Batangas photos; building shapes may be stylised.

## Evidence on Hand

- Copy and figures: `lib/content.ts`, `public/llms.txt`.
- Campus reference photos (8, HEIC converted to JPG).
- Brand assets from the app repo (E1yWrites/parada): the PARADA logo, P mark, guard-dog mascot and the app's tagline "Guiding every vehicle to its zone." (admin sign-in screen).
- The final capstone paper (`parada-V2 (1).pdf`, November 2026), including UAT results and the prototype's default fee (₱20 first two hours, ₱10 per started hour after).
- `public/campus/hero-*.webp`: stills rendered from the site's own 3D campus (the demo's hero camera, UI hidden), used as the landing hero.
- Absent: real app screenshots on the site (the paper's Figures 9–49 are real screenshots but are not yet exported), testimonials. Do not fabricate them.

## Product Principles

1. Show the mechanism, don't describe it: the trip through the gates is the explanation.
2. Every number on screen matches `lib/content.ts`.
3. The 3D layer enhances the site and never gates it.
4. Zone over slot, everywhere.

## Accessibility & Inclusion

Keyboard and touch controls for the game; every fact also in HTML; reduced-motion respected; text contrast at WCAG AA.
