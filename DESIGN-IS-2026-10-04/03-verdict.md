# Verdict: REDESIGN

The current page scores 15/30. Honesty (#6) and usefulness (#2), both load-bearing, score 1. The same pipeline story is told three times over 20 chapters while the copy contradicts the zone-based model, so rebuild from purpose instead of re-skinning.

## Top moves
1. **#2 Useful:** tell the pipeline once, as something you can play. Split the marketing story (home) from the technical/panel material (`/technical`). Evidence: 20 chapters, 24,107 px.
2. **#6 Honest:**
   - Reword the mobile steps at zone level, using only features the site lists.
   - Use one name for Zone A ("North parking area").
   - Move the "near full" flag to Zone B (84%).
   - Evidence: `index.html:1137`, `:1145`, `:1161`, `:926`, `:1218`.
3. **#3 Aesthetic:** one type scale with a 14 px floor for labels, 16 px body, and at most 9 colour tokens. Use the occupancy ramp as the only semantic colours. Evidence: 20 sizes, 32 hex.
4. **#8 Thorough:**
   - Add a visible focus ring, a skip link and SVG icons.
   - Zero console errors.
   - A fallback when WebGL is unavailable, plus a loading state for the canvas.
   - Evidence: focus-visible 0, 5× 404.
5. **#9 Environment:** pre-render the HTML at build time (static export), lazy-load the 3D, pause rendering when off-screen, keep sound opt-in. Evidence: runtime Babel compile.
