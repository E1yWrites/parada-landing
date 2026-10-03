# PARADA — project site

Official site for **PARADA**, a smart parking management system built as a BSIT capstone at Lyceum of the Philippines University — Batangas. It uses zone-gate cameras, CV/OCR plate recognition, and zone-based occupancy.

- `/` — **Experience**: an interactive 3D tour of the parking lot, driven by scrolling.
- `/technical/` — **Technical**: architecture, features, stack, security and status, written for the capstone panel.

## Stack
- Next.js (static export) + React Three Fiber + drei + GSAP ScrollTrigger.
- All copy is plain pre-rendered HTML. The 3D canvas loads after first paint and is optional: with no WebGL or with reduced motion, the page still reads completely.

## Where things live
- `lib/content.ts` holds every fact on the site. Change numbers there only; `lib/content.test.ts` guards them.
- `components/scene/cameraPath.ts` holds the camera stops. Each `data-cam="<key>"` element in the page is one stop.

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + fact tests
npm run build   # static site in out/
```
