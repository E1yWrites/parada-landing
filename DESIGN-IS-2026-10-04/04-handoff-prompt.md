```
/make-plan Redesign the PARADA landing site. Current design failed audit at 15/30 with critical gaps in principles #2 useful, #6 honest, #3 aesthetic, #8 thorough, #10 little design.

Verdict paragraph:
> The current page scores 15/30. Honesty (#6) and usefulness (#2), both load-bearing, score 1. The same pipeline story is told three times over 20 chapters while the copy contradicts the zone-based model, so rebuild from purpose instead of re-skinning.

Why redesign and not refine: total is below 20 and both load-bearing principles (#2, #6) score 1.

Preserve:
- Every fact and number: zones A 18/30, B 42/50, C 15/40; the 9 pipeline steps; stack; security rules; status lists.
- Brand name "PARADA" and the GitHub/email links.

Discard:
- 20-chapter single scroll. Evidence: 24,107 px. Caused failure on #2.
- Slot-level mobile copy. Evidence: index.html:1137, 1145, 1161. Caused failure on #6.
- Micro-type and the ad-hoc palette. Evidence: 20 font sizes, 32 hex values. Caused failure on #3.

Top moves:
1. #2: one playable pipeline; home = marketing, /technical = panel material.
2. #6: zone-level copy; Zone A = "North parking area"; "near full" flag on Zone B (84%).
3. #3: one type scale, 14 px floor for labels, at most 9 tokens.
4. #8: focus ring, skip link, SVG icons, zero console errors, no-WebGL fallback.
5. #9: static export, lazy 3D, pause rendering off-screen, opt-in sound.
```
