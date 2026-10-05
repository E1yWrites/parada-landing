# PARADA — project site

Official site for **PARADA**, a smart parking management system built as a BSIT capstone at Lyceum of the Philippines University — Batangas. It uses zone-gate cameras, CV/OCR plate recognition, and zone-based occupancy.

- `/` — **Experience**: an interactive 3D model of the LPU-Batangas campus. Scrolling follows one car through PARADA's pipeline; **Drive in** lets you drive it yourself under the same rules.
- `/technical/` — **Technical**: architecture, features, stack, security and status, written for the capstone panel.

## Stack
- Next.js (static export) + React Three Fiber + drei + GSAP (the tour's timeline, scrubbed by a damped scroll position).
- All copy is plain pre-rendered HTML. The 3D canvas loads after first paint and is optional: with no WebGL or with reduced motion, the page still reads completely.

## Where things live
- `lib/content.ts` holds every fact on the site. Change numbers there only; `lib/content.test.ts` guards them.
- `components/scene/cameraPath.ts` holds the camera stops. Each `data-cam="<key>"` element in the page is one stop; pipeline stops follow the tour car.
- `components/scene/layout.ts` is the campus: zones, gates, the loop driveway, buildings (polygons traced from satellite imagery), walkways, trees, houses and streets. Only Zone A is modelled. Zone counts change only at gate cameras, as in the PARADA backend.
- `components/scene/campusData.ts` is generated from OpenStreetMap by `node scripts/campus-data.mjs` (campus edge and the houses around it). Map data © OpenStreetMap contributors (ODbL).
- Vercel Web Analytics (`@vercel/analytics`, cookieless, same-origin script) is mounted in `app/layout.tsx`; the privacy notice describes it.
- `public/brand/` holds the PARADA logo, mark and mascot from the app repo.
- `app/docs/` and `app/legal/` (terms, privacy, licences) summarise the PARADA repository; `components/AppScreens.tsx` draws the driver app and admin console at step 7 after the app's own design.
- `public/models/` holds the Kenney Car Kit cars (CC0); see `CREDITS.txt`. Buildings, trees, houses and streets are generated in code (`Buildings.tsx`, `Trees.tsx`, `Campus.tsx`).

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + fact and admission-rule tests
npm run build   # static site in out/
```
