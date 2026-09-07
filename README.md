# PARADA — Landing Page

A faithful 1:1 reproduction of the **PARADA** landing page, a mobile and web-based smart parking management system for zone-based occupancy detection using OCR-assisted cameras.

This is a capstone-defense marketing page for the Bachelor of Science in Information Technology program at Lyceum of the Philippines University — Batangas. It is intentionally honest about project status: it reflects the implemented features and the OCR / computer-vision phases that are still in continuing evaluation.

## What's here

This is the original design-tool landing file (`PARADA Landing.dc.html` → `index.html`) copied word-for-word, plus the two runtime files it depends on (`support.js` and `image-slot.js`). Nothing is rewritten or simplified — every animation is reproduced exactly as designed, including:

- Pinned hero with the interactive scan-canvas, poster auto-fit, and word/atom reveal.
- The horizontal cinematic **pipeline** (a 900svh sticky section) with 9 individually-animated SVG scenes driven by GSAP `MotionPathPlugin` — vehicle arrival, camera capture, computer-vision + OCR, the PARADA API hub, vehicle/user/guest resolution, occupancy + session, mobile + admin, exit, and fee receipt.
- The animated **registered-vs-guest** compare flow with live plate decoding and policy pulses.
- The **architecture pipeline** SVG with looping motion-path packets.
- Zone-occupancy cards, module cards, config/stack/status grids, admin dashboard, and security rules.

## Structure

```
parada-landing/
├── index.html          # the full landing page (PARADA Landing.dc.html verbatim)
├── support.js          # dc-runtime boot (auto-loads React/Babel and mounts the page)
├── image-slot.js       # <image-slot> placeholder custom element
└── assets/
    └── laptop-hw.png   # hardware render (transparent laptop PNG used in the admin section)
```

## Run it

The page uses a component runtime that must be served over HTTP (fetch/relative files), and it pulls React, Babel, GSAP and fonts from CDN on first load:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Screenshot placeholders

No real app screenshots exist in this repository yet. The mobile and admin "experience" sections use `<image-slot>` placeholder elements labeled "Drop screen … here". To finalize the page, drop the intended app screenshots into the corresponding slots; they persist in a `.image-slots.state.json` sidecar next to `index.html`.

## Related

- Source code & architecture: [E1yWrites/parada](https://github.com/E1yWrites/parada)
