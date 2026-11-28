---
name: PARADA
description: Smart zone-based campus parking, told as the vehicle pass, gate stamps and official receipt over an accurate daylight model of LPU-Batangas.
colors:
  mint: "#dfeee3"
  mint-2: "#cfe4d6"
  mint-3: "#b9d7c3"
  guilloche: "#2f7a5b"
  green-ink: "#1f5a43"
  stamp: "#c04028"
  stamp-deep: "#8f2c1a"
  id: "#1d4e9e"
  id-deep: "#143a78"
  gold: "#e2b23c"
  gold-deep: "#9a6f0e"
  visitor: "#f3dc97"
  ink: "#1a1a1a"
  ink-soft: "#3d4a44"
  paper: "#fbfaf5"
  sky: "#cfe2ee"
  free: "#2f9e5b"
  busy: "#e2a312"
  full: "#d8263a"
typography:
  display:
    fontFamily: "Sofia Sans Extra Condensed, system-ui, sans-serif"
    fontSize: "34cqi"
    fontWeight: 900
    lineHeight: 0.8
    textTransform: uppercase
  headline:
    fontFamily: "Sofia Sans Extra Condensed, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.95
    textTransform: uppercase
  title:
    fontFamily: "Sofia Sans Extra Condensed, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 800
    lineHeight: 1
    textTransform: uppercase
  body:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  label:
    fontFamily: "Sofia Sans, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.1em"
    textTransform: uppercase
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.1rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  pass: "18px"
  pass-hud: "14px"
  button: "7px"
  tick: "5px"
  box: "4px"
  lamp: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  pass-pad: "clamp(1.4rem, 3vw, 2rem)"
  field-gap: "0.9rem 1rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.stamp}"
    textColor: "#ffffff"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 1.25rem"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 1.25rem"
    height: "48px"
  pass:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pass}"
    padding: "{spacing.pass-pad}"
    width: "min(100%, 34rem)"
  visitor-pass:
    backgroundColor: "{colors.visitor}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pass}"
  field:
    textColor: "{colors.ink}"
    typography: "{typography.data}"
  tick-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tick}"
    height: "44px"
  nav-tab-current:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    height: "44px"
  receipt:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
---

# Design System: PARADA

## Overview

**Creative North Star: "The Vehicle Pass"**

Every LPU-Batangas driver already carries the paperwork that explains PARADA: a vehicle sticker, a laminated gate pass, a stamp when the guard waves you in, a receipt when you leave. The site is built from those objects. Panels are laminated passes in security-print mint with guilloche linework generated from the plate on the pass; headings are condensed caps that fill the form; facts sit in ruled fields; the nine pipeline steps are stamp boxes that get stamped red, in order, and never come off; the exit prints an official receipt with the exit camera's stamp.

The passes float over the real campus in daylight: footprints traced from satellite imagery, painted-concrete buildings with sun-shade ledges and window bands, hipped metal roofs where the imagery shows them, the rain-tree canopy, electric poles wired along Tolentino Rd and Doña Aurelia St, plastered neighbourhood houses under corrugated roofs. Nothing is dark, neon or surveillance-toned, and nothing is a toy-kit block.

**Key Characteristics:**
- Laminated mint pass cards, plate-seeded guilloche, an overlapping laminate sleeve for depth
- Sofia Sans Extra Condensed caps for every heading; Sofia Sans for reading; JetBrains Mono for plates, counts, times
- Ruled form fields whose line carries state; tick boxes for choices
- Stamp red for the action and the stamps; ID blue for Registered and the lanyard header; pass gold for Guest
- Occupancy colour only on numbers that can change

## Colors

Security-print mint carries the surfaces; three ink colours do jobs.

### Primary
- **Security Mint** (#dfeee3): every pass, the zone tag, the HUD, the current tab. Ink text on it is above 14:1.
- **Guilloche Green** (#2f7a5b): the guilloche linework (at 20–34% stroke opacity), dashed pending stamp boxes, the accelerator pedal.
- **Green Ink** (#1f5a43): small-caps field labels and legends on mint (7:1).

### Secondary
- **Stamp Red** (#c04028, sampled from the PARADA logo) / **Stamp Deep** (#8f2c1a): the primary action (a red field with a white inner frame, like a rubber stamp), stamped boxes and step numbers, the receipt's EXITED stamp, the denied toast, tick marks.
- **ID Blue** (#1d4e9e) / **ID Deep** (#143a78): the header strap and footer, the pass's issuer band, the Registered marker, links, focus rings on light grounds, the dim layer behind the technical tab.

### Tertiary
- **Pass Gold** (#e2b23c) / **Visitor** (#f3dc97): the Guest marker, the visitor-pass card (guest policy chapter), warning toasts, text selection, focus rings on blue.

### Neutral
- **Form Ink** (#1a1a1a) / **Ink Soft** (#3d4a44): all text, field rules, button frames. Ink Soft is green-tinted, never plain grey.
- **Official Paper** (#fbfaf5): buttons, tick boxes, the receipt, the technical form, chain boxes.
- **Morning Sky** (#cfe2ee): page ground before the canvas paints, the scene's sky.

### Named Rules
**The State Colour Rule.** Free (#2f9e5b), busy (#e2a312) and full (#d8263a) appear only as zone lamps, meters and the scene's bay tint, and only where an occupancy number can change.

**The Pass Colour Rule.** Blue means Registered, gold means Guest, red means stamped or act. A colour never borrows another's job.

## Typography

**Display Font:** Sofia Sans Extra Condensed 800/900
**Body Font:** Sofia Sans 400/600/700
**Data Font:** JetBrains Mono 400/500/700

**Character:** institutional form lettering. The extra-condensed caps are the face printed across ID cards and registrar forms; Sofia Sans is the plain reading face of the same family; the mono is what a plate or a receipt is printed in.

### Hierarchy
- **Display**: no typeset display line. The PARADA logotype (`public/brand/logo.webp`, from the app repo) is the wordmark on the landing hero pass; condensed caps start at the headline (landing bands up to 4.75rem at 900, the hero line up to 3.7rem).
- **Headline** (800, clamp(2rem → 3rem), 0.95, caps): chapter headings.
- **Title** (800, 1.55rem, caps): step and card headings, toast titles, button lettering (1.15rem).
- **Lead** (Sofia Sans 700, 1.25rem): the tagline under a heading.
- **Body** (400, 1.0625rem, 1.55): paragraphs; passes cap the measure at 34rem (54rem wide).
- **Label** (700, 0.72rem, 0.1em tracking, caps, green ink): field labels, legends, gauge labels.
- **Data** (JetBrains Mono, tabular): plates, zone counts, session timer, speed, receipt rows, stamp-box numbers.

### Named Rules
**The Mono Means Measured Rule.** Mono only for plates, counts, durations and identifiers.

**The Full Measure Rule.** Headings are condensed caps set large enough to run most of the pass's width; they never shrink to a polite subhead.

## Layout

**Home (/), the landing page, is plain HTML.** The 3D campus is never downloaded there; the hero is a still rendered from the model (`public/campus/hero-wide.webp`, and `hero-tall.webp` on phones), taken from the demo's hero camera with the UI hidden. Full-bleed bands, each a 2px ink rule from the last, alternate Official Paper and Security Mint washed over the guilloche (66%, so it never reads as moiré); content sits in a 76rem column with the gutter. Order: the hero pass over the campus still (33rem, top-left; on phones the still takes 44svh and the pass overlaps it by 3.5rem) → the problem (ruled pain lines and the cost argument beside a pass showing a busy morning) → the three stops over the gate simulator, with the receipt tray beside it → the two app screens zig-zagging with what each side gets → the proof as three ruled fields → the pilot ask on a wide pass, the address beside a Copy address link for visitors without a mail app. Landing headings are 900-weight condensed caps at up to 4.75rem, 17ch measure.

The landing page is run, not read. Three interactions, each showing something PARADA really does:
- **Hero pins** (`HeroPins.tsx`): stamp-red dots in white rings on the campus still (entry camera, Zone A's count, the sensor-free bays), rippling three times on load. Hover, focus or tap opens a paper tag on a leader above the pin; one open at a time, Escape or a tap elsewhere closes it. The still sits in a frame that reproduces object-fit: cover in container units, so the pins hold their spot at any size; each image sets its own pin fractions.
- **Today / With PARADA** (`Morning.tsx`): a two-way switch on the busy-morning pass: one stamp-red fill slides to the chosen side (0.22s, expo out; instant under reduced motion). Today, lamps go hollow, meters empty and hatch, counts become `?`; With PARADA, the meters fill left to right (0.6s, 90ms apart). Without script it shows the PARADA view.
- **The gate simulator** (`GateSim.tsx`), the focal moment, drawn into the page rather than boxed as a widget: one sheet in three columns, one per stop. Each stop's note (stamp box, title, line) sits above its spot on the plan, entry gate, the zone, exit gate, with a leader dropping to it: dashed green while pending, solid stamp red once that stop has happened, the stamp box stamped at the same moment. Below the plan, what each stop produced: under the entry, the entry camera's read on a white plate (blue frame reading, green accepted, red struck through when turned away) and the visitor's own plate field with Drive in, since the visitor is the car at the gate; under the zone, the count and meter, the driver-app and dashboard chips that flash on a change, the status line, and Rush hour / Reset as ID-blue condensed-caps links; under the exit, the exit camera's read and the receipt, which prints down out of the exit (clip-path, stepped like a printer) and takes keyboard focus, since the car's button is gone. The plan is linework in the page's ink on a paper wash over the mint: a 2px ink frame, green-ink bay lines, a green-tinted aisle between ruled edges with a dashed centre line, mint chips for ENTRY, ZONE A and EXIT, everyone else's cars in outline, the visitor's filled Registered blue (buttons: tap to drive out), ink cameras with a blue read cone, red-and-white booms that swing open. The count rises when the entry camera accepts the plate, never at the bay. The gate turns cars away as PARADA does: not Philippine format, a plate already inside, or a full zone. The first time the plan is on screen one car drives itself in. Sound follows the header toggle. On a phone the columns stack (notes, plan, results) without leaders. Without script the plan renders still with every stop stamped and the controls disabled; under reduced motion every move is instant and the stamps don't bounce.

**Demo (/demo/) is a run of snap pages over the 3D campus.** Every section is exactly one screen under the sticky header (`min-height: calc(100svh - var(--header))`) and one camera stop, keyed to the section's top, so a snapped section is an exact stop and the 3D view stops rendering until the next scroll. CSS mandatory snap handles touch and the scrollbar; one mouse-wheel notch or one key (PageDown/PageUp, arrows, Space) pages one section (`components/SnapPop.tsx`). Each section's card pops in as it lands (opacity plus a 1.4rem rise, 0.55s expo; no rise under reduced motion). Moving forward the camera pans; any step back is a cut: the stage fades to Morning Sky, the camera goes straight to its stop while covered, and the fade lifts once the page is still (`startCut()` in `components/scene/state.ts`). Inside the tour a one-step move plays at a set pace (0.6 steps/s; the drive up Tolentino Rd at 0.35; out of the bay, round the loop and up to the exit camera at 0.17). Order: the pass (title, plate fields, DRIVE IN, Watch the trip, zone tally, loading line) → the entry corner → the nine stops, passes alternating left and right → the drive setup → the pilot ask over the dimmed campus. Below 768px passes drop to the bottom of their section, full width, with the scene above. Drive mode hides the sections (visibility, so scroll survives), locks scroll and lays the HUD over the canvas.

## Elevation & Depth

Depth comes from overlap, never from glow. Each pass sits in a laminate sleeve: a `::before` layer 7px larger on three sides and 11px at the bottom, translucent mint with a 2px backdrop blur, a white hairline and a 1px contact line. The card itself carries a laminate edge (`inset 0 1px 0 white, inset 0 0 0 1px rgb(31 90 67 / 0.28)`). Paper objects (receipt, technical form, 3D receipt) take a 1px contact line plus one long soft drop.

## Shapes

ID-card corners on passes (18px, 14px in the HUD and on phones); buttons 7px; tick boxes 5px; chain boxes, receipt and form cells 4px; lamps round; stamps are circles or squares rotated −7° to −9°.

## Components

### Brand
The PARADA logo, P mark and mascot come from the app repo (`E1yWrites/parada`, `apps/*/brand`, `apps/mobile/assets/lottie`) and live in `public/brand/`. The mascot is Lottie, PARADA's guide character (the dog in the P cap, named in the paper's welcome screens); it appears only on the 404 page.

### Pass (signature)
Mint card with guilloche, laminate edge and sleeve. The hero pass adds an ID-blue issuer band across its top (brand mark, "Smart parking pass", a punched lanyard slot, LPU-B) and its own fields: plate, type, route. The visitor pass is the same card in Visitor gold.

### Fields
Small-caps green-ink label over a 2px ruled value. State is the line: solid when done, dashed when pending, struck through when void. Zone counts use the same anatomy with a state lamp before the number.

### Buttons
Primary: stamp red with a white inner frame, white condensed caps (DRIVE IN, Keep driving). Secondary: paper with a 2px ink frame. Hover lifts 1px; press scales to 0.985; focus is a 3px ID-blue ring (gold on blue grounds). Hover motion (the lift, the deeper red, a parked car's scale, a pin's tag) applies only under `(hover: hover) and (pointer: fine)`, so a tap never leaves a hover stuck on a touch screen; press feedback (scale 0.97, 0.16s) applies everywhere. Secondary actions inside a form (Rush hour, Stop, Reset, Copy address) are ID-blue condensed-caps links, not buttons.

### Tick Boxes (plate and guest policy)
Radio inputs drawn as paper boxes with an ink frame and a square tick box; checked fills the box stamp red with a white tick and thickens the frame; mono hint line under the label.

### Navigation
ID-blue lanyard header with a fine woven texture, the PARADA P mark on a white tile and the name in condensed caps; tabs (Home, Demo, Technical, Legal, then GitHub with an out-arrow, since the documentation lives with the code) as 44px links, the current tab a mint chip; on phones the P mark stands in for the word.

### Landing parts
Pain lines are ruled rows in Sofia Sans 700 (2px rules top and bottom, mint hairlines between). Stamp boxes are 3.4rem squares in stamp red with a double frame, rotated −8°, red mono numbers; pending they are dashed guilloche green, unrotated. Proof figures are ruled fields: small-caps label, a mono figure up to 3.2rem over a 2px rule, the caveat in small Ink Soft text under it. The receipt reuses the HUD's official receipt.

### Drive HUD
Smaller passes: plate (white plate, ink mono) and objective; trip meter with zone fields, session and km/h gauges, Leave; toasts tinted by tone (mint info, green ok, visitor-gold warn, stamp-red bad with white text); mint pedals on touch; the controls strip at the bottom is real buttons (hold W A S D / Space, tap H and R), each lighting while its key is held; the official receipt with a guilloche band and the EXITED stamp naming the exit camera.

### App screens (demo step 7, and the landing page)
The two PARADA clients drawn in HTML after the app's own design system, not this site's: the driver app's "Home: parked" screen in a phone (navy #273248 ground, #FC7643 action, Space Grotesk headings, Inter text, the floating tab bar, the mascot) and the admin console dashboard in a browser frame (near-black rgb(18 19 22), amber rgb(247 147 26), sidebar, metric cards, live alerts, recent entries). Sized in em off one clamp() font size; on the demo phones show the driver app only. `AppScreens part="driver"|"admin"` renders one at a time, in flow, for the landing page. Figures are the tour's post-entry state from `lib/content.ts`. Space Grotesk and Inter load only for this component.

### Technical Form
Official paper with a guilloche band across the top, 2px ink rules between sections, a TOC as a strip of form cells, cards and journey as ruled grids, architecture nodes numbered with red stamp circles. The Legal pages use the same form (`components/DocPage.tsx`): spec tables with small-caps column heads, code blocks on mint, numbered steps with stamp-red markers, and a mono "Source:" line under each section linking the repository file it summarises.

## The Campus Model

Accurate first: footprints traced from satellite imagery (the tracing board lives locally in `research/`, not in git, because it contains Esri imagery), OSM for the campus edge and the houses, the Zone A loop with its entry canopy and north exit gate where they really are. Only Zone A is modelled. Buildings carry the official campus map's names and legend numbers (JPL 2, Gymnasium 3, Leviste 4 with its name board, Culture and Arts 5, PHC Labs 6, LSSC 7, SHL 8, Chapel 9, Power House 10, Administration 11, Mabini 12, Malvar 13, staff houses 14, GenSet 15, HVSG 16, and the water tanks the map draws as circles). The gymnasium east of the JPL wing follows LPU-B's photos of the sports arena: open sides on steel columns with low cream walls and see-through dark mesh above them, steel trusses, cream end walls carrying the gable, a low-pitch metal roof with skylight rows, two courts in a maroon surround with hoops, stepped bleachers. The chapel inside the loop follows the campus chapel: open to the north under a white concrete canopy on piers that lean outward, a brick altar wall with a round arch of stained glass, pews and an altar table. Cars (Quaternius, CC0) are repainted in a campus lot's colours, the player's car ID blue; a row of motorcycles parks along the JPL wall; the rain trees are a CC0 acacia spread round and flattened, its crown taking each tree's leaf tint and its trunk staying brown (all one meshopt GLB, `public/models/props.glb`). Surfaces get world-space weathering noise (`components/scene/materials.ts`) instead of texture downloads, and sloped roofs get corrugated-metal ribs drawn in the same shader, fading out at a distance before they shimmer; light is a warm mid-morning sun from the east-south-east with soft 4K shadows on desktop, a hazy hemisphere fill and a one-off procedural environment for glass and paint reflections. Phones drop shadows. The world ends in haze, not an edge: a radial term in the shared fog chunks (`components/scene/fogFade.ts`) dissolves everything 175–255 m from the campus centre into the sky colour. Performance: shadows are baked once when the scenery mounts (the moving car carries a soft blob instead), the canvas renders at 0.55× resolution while the camera travels and full resolution when it lands, then stops rendering. The camera never sits inside a building, roof, house, canopy or pergola: `outsideSolids()` in `layout.ts` steps it out toward its target, for the tour and the drive chase camera alike.

## Do's and Don'ts

### Do:
- **Do** put new panels on a pass (mint) or on paper (receipts, forms).
- **Do** carry state in line style and stamps, with colour as the second signal.
- **Do** keep blue for Registered, gold for Guest, red for stamped or act.
- **Do** set every count, plate and duration in JetBrains Mono from `lib/content.ts` or live drive state.
- **Do** keep the campus accurate to the traced map; stylise detail, never position.

### Don't:
- **Don't** add eyebrow or kicker labels above headings.
- **Don't** use soft glows, glass for its own sake, or hard offset block shadows; depth is the laminate sleeve.
- **Don't** use the free/busy/full colours where a number can't change.
- **Don't** reintroduce kit buildings or toy blocks into the campus.
- **Don't** use emoji or Unicode glyphs as icons; icons are inline SVG at a 2.2–2.4 stroke.
