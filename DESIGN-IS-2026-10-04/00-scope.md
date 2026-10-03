# Scope
- Audited: `index.html` (= live parada-landing.vercel.app; only diff is the Vercel analytics tag), `support.js`, `image-slot.js`.
- Primary users: (1) visitors/marketing audience, (2) LPU-Batangas capstone panel.
- Primary task: understand what PARADA does (arrival → receipt, zone-based occupancy) and how far the build has got.
- Constraints: facts must match the live site; Next.js + R3F + GSAP; must work without WebGL, on phones, under reduced motion.
- Measured with Playwright (Chromium 1243) at 1440×900 against the live URL. No subagents; evidence gathered inline.
