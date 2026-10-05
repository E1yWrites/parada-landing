# 00 · Scope

**Audited:** PARADA landing site, repo `/home/e1yu/parada-landing`, branch `redesign-3d`, commit `62fabe4`.
Running instances: dev server `http://localhost:3000`, production static build `http://localhost:4173` (`out/`).

## Surfaces
1. **Home / Experience** (`app/page.tsx`): a fixed, full-viewport 3D model of the LPU-Batangas campus (`components/scene/*`)
   behind scrolling "route board" chapters: hero, About (zone tallies), Problem, How it works (9 pipeline steps, the camera
   follows one demo car), Guest, Play (drive mode setup), Apps, Architecture, Contact. Drive mode (`components/DriveHUD.tsx`,
   `components/scene/Drive.tsx`) lets the visitor drive the car under PARADA's zone-gate rules.
2. **Technical** (`app/technical/page.tsx`): a printed spec sheet over the dimmed scene.
3. Shared chrome: header with tabs, sound toggle, nine-lamp step bar (`components/LightBar.tsx`), footer with credits.

## Primary user and task
- **Primary:** LPU-Batangas drivers, administrators and stakeholders landing on the project site. Task: understand in
  seconds what PARADA does (cameras at zone gates read plates; each zone keeps a live count) and why it beats circling
  the lot, then watch or drive one trip from entry gate to exit gate.
- **Secondary:** the BSIT capstone panel, who read the Technical tab and expect every fact to be accurate.

## Constraints
- Brand/world: "jeepney route board" system recorded in `DESIGN.md` (enamel boards, chrome frames, Bungee lettering,
  occupancy colours only on state).
- Facts only from `lib/content.ts`; zone-level claims only; honest capstone status (`PRODUCT.md`).
- Stack: Next.js static export, React Three Fiber, drei, GSAP; must work without WebGL; reduced motion respected;
  60 fps target, DPR ≤ 2, no mobile shadows.

## Reference material
- Product truth: `PRODUCT.md`; design system: `DESIGN.md`, `.impeccable/design.json`; surface brief:
  `.impeccable/surfaces/app-page-tsx.md`.
- Original site (logic reference): `E1yWrites/parada-landing` `index.html` on `main`; PARADA app `E1yWrites/parada`
  (`services/api/src/domain/occupancy.ts`).
- Screenshots from this round: scratchpad `s6-*.png` (desktop stops), `m-*.png` (phone), `trip-*.png` (drive mode).
