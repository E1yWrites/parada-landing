# Evidence

## Structural
- 21 `<section>` blocks / 20 numbered chapters; page height 24,107 px at 1440×900.
- Interactive elements: 14 `<a>`, 8 `<button>`.
- Duplicated purposes: "18 Demo" re-links to How it works / Mobile / Admin; "16 Highlights" restates Features (06), Zone-based (05), Architecture (11); "11 Architecture" restates the 04 pipeline (its own copy says so).

## Visual
- Type scale: 20 distinct font sizes, 6–26 px; 165 of 375 visible text nodes are under 12 px (sizes 6, 7, 8, 8.5, 9, 9.5, 10, 10.5, 11 px).
- Colors: 32 distinct hex values in `index.html`, from 7 declared tokens (`--ink`, `--orange`, `--glacier`…).
- Lowest measured contrast is 1.00:1 on "For drivers" (20 px). Probably a pre-reveal animation state: text hidden until scroll counts as low contrast.
- States: focus-visible styles 0, skip link missing, reduced-motion handled (4 queries), image-slot loading/empty state present, 404 console errors on load.
- One emoji used as an icon (🔍, `index.html:1182`).

## Copy & honesty
- Slot-level claims that contradict "zone, not slot" and aren't in the Features or Status lists:
  - "Lock your bay in 2 taps. Guaranteed spot" (`index.html:1145`)
  - "Filter by EV, accessible, or covered" (`:1137`)
  - "one-tap extension, and automatic checkout" (`:1161`)
- Zone A is called "A — Riverside" (`:926`) in one place and "North parking area" in the admin panel.
- "Zone A 60% — near full" (`:1218`), while Zone B is at 84% (42/50).
- Jargon without explanation: "backend-authoritative", "one authoritative transaction".

## Weight & friction
- 20 requests; 282 KB of JS (decoded); networkidle reached at 1,191 ms.
- React + ReactDOM + Babel standalone load from unpkg, and the page is compiled in the browser at runtime (`support.js`).
- Animation: 4 GSAP timelines, 1 infinite loop. 0 modals.
- Console: 5× 404 (image-slot placeholders).
