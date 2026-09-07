# PARADA — Landing Page

A standalone, self-contained landing page for **PARADA**, a mobile and web-based smart parking management system for zone-based occupancy detection using OCR-assisted cameras.

This is a capstone-defense marketing page for the Bachelor of Science in Information Technology program at Lyceum of the Philippines University — Batangas. It is intentionally honest about project status: it reflects the implemented features and the OCR / computer-vision phases that are still in continuing evaluation.

## Content

The page is a single deployable `index.html` with an embedded design system and lightweight scroll-reveal animations. Its 20 sections cover:

- Hero — "Smart parking, designed for smarter campuses"
- About — What is PARADA? (zone-based occupancy)
- Problem & objective
- How it works — the 9-step arrival-to-receipt pipeline
- System modules — Driver, Parking intelligence (Core), Administration
- Guest admission logic
- Mobile & admin experiences (screenshot placeholders)
- Configuration, architecture, and technology stack
- Security
- Capstone context and development journey
- Current project status (Implemented vs. Continuing)
- Demo, transparency, and contact

## Structure

```
parada-landing/
├── index.html            # the full landing page (self-contained)
└── assets/
    └── laptop-hw.png     # hardware render used in the admin section
```

## Deploy

Because it is a single static HTML file, it can be served from anywhere:

```bash
# locally
python3 -m http.server 8080
```

Or deploy `index.html` to any static host (GitHub Pages, Netlify, Vercel, etc.).

## Screenshot placeholders

No real app screenshots exist in this repository yet. The mobile and admin "experience" sections use dashed placeholder surfaces labeled "Drop screen … here". To finalize the page, drop the intended app screenshots into the corresponding `screen` containers or replace the `.ph` placeholder elements.

## Related

- Source code & architecture: [E1yWrites/parada](https://github.com/E1yWrites/parada)
