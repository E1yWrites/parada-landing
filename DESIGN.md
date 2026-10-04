---
name: PARADA
description: Smart zone-based campus parking, told as a hand-painted jeepney route board over a sunlit 3D campus.
colors:
  board: "#1b3fb8"
  board-deep: "#12297d"
  jeep: "#c42525"
  jeep-deep: "#921717"
  cream: "#fff3d1"
  cream-soft: "#eee3c3"
  curb: "#f6c31c"
  chrome: "#c9cfd6"
  asphalt: "#24262b"
  asphalt-2: "#33363d"
  leaf-deep: "#1f6b3b"
  ink: "#121418"
  ink-soft: "#4a4f57"
  paper: "#fff8e6"
  sky: "#bfe3f5"
  free: "#3ccf74"
  busy: "#f6c31c"
  full: "#ff4a3d"
typography:
  display:
    fontFamily: "Bungee, system-ui, sans-serif"
    fontSize: "clamp(3rem, 1.8rem + 5vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Bungee, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.1rem + 1.5vw, 2.15rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.01em"
  title:
    fontFamily: "Bungee, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.06
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.3
  label:
    fontFamily: "Bungee, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.05rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  chip: "6px"
  control: "8px"
  button: "9px"
  board: "12px"
  lamp: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  board-pad: "clamp(1.5rem, 3vw, 2.2rem)"
  stack: "0.75rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.jeep}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0 1.3rem"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0 1.3rem"
    height: "48px"
  route-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.cream}"
    rounded: "{rounded.board}"
    padding: "{spacing.board-pad}"
    width: "min(100%, 34rem)"
  route-board-red:
    backgroundColor: "{colors.jeep}"
    textColor: "{colors.cream}"
    rounded: "{rounded.board}"
    padding: "{spacing.board-pad}"
  tally-cell:
    backgroundColor: "{colors.board-deep}"
    textColor: "{colors.cream}"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.75rem"
  choice-chip:
    backgroundColor: "{colors.board-deep}"
    textColor: "{colors.cream}"
    rounded: "{rounded.control}"
    padding: "0.35rem 0.9rem"
    height: "44px"
  choice-chip-selected:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
  nav-tab-current:
    backgroundColor: "{colors.curb}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  spec-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "10px"
---

# Design System: PARADA

## Overview

**Creative North Star: "The Route Board"**

Every piece of interface is a sign you would see on a Batangas jeepney or at a campus gate: a flat enamel board in ultramarine or jeep red, framed in polished chrome, with a thin yellow pinstripe set inside the frame and a rivet in each corner. Lettering is cream, painted in a chunky display face with a red drop shade, the way a sign painter shades block letters. The boards float over a real place, a sunlit 3D model of the LPU-Batangas parking loop at tropical noon, and the camera moves through it as you read.

The world is bright and specific, not dark-mode SaaS. Asphalt grey belongs to the road furniture (header, footer, lamp strip, touch pedals), curb yellow marks what is live or selected, and the green / yellow / red occupancy ramp appears only where a zone count actually changes. Numbers are tallies, set in mono. The technical tab keeps the same voice as a printed spec sheet laid over the dimmed campus.

**Key Characteristics:**
- Enamel boards with chrome frame, inset yellow pinstripe and corner rivets
- Cream Bungee lettering with a hard sign-painter drop shade
- Sunlit low-poly campus (Kenney kits) as the permanent backdrop
- Curb-paint stripes and a nine-lamp strip as the page chrome
- Occupancy colour only on state that changes; mono for every count, plate and timer

## Colors

Two enamels, one cream, road furniture and a three-step occupancy ramp.

### Primary
- **Route Board Ultramarine** (#1b3fb8): the default board, zone tags in the scene, chips on the spec sheet. Cream text on it clears 7:1.
- **Deep Ultramarine** (#12297d): wells inside a board (tally cells, zone rows, unselected choices) and the drop shade on red boards.

### Secondary
- **Jeep Red** (#c42525): primary action buttons, the red board variant (guest policy, 404, denied toast), step-stop badges. Cream text on it is above 4.5:1; never put cream-soft on red.
- **Jeep Red Deep** (#921717): the drop shade under lettering on red buttons.

### Tertiary
- **Curb Yellow** (#f6c31c): pinstripes, the current nav tab, focus rings, selection, labels and legends on boards, the lit lamp. It is the "this is live / this is you" colour.
- **Leaf Deep** (#1f6b3b): success toasts and the accelerator pedal.

### Neutral
- **Sign Cream** (#fff3d1): all lettering and body text on enamel; secondary buttons.
- **Faded Cream** (#eee3c3): secondary text on ultramarine only (6.9:1).
- **Polished Chrome** (#c9cfd6): frames (as a gradient from #f6f8fa through #8d96a0), sign posts, kbd underline.
- **Asphalt** (#24262b) / **Asphalt Lift** (#33363d): header, footer, lamp strip, pedals, hover on header links, the dim layer behind the technical tab.
- **Ink** (#121418) / **Ink Soft** (#4a4f57): text on paper, plates and cream buttons.
- **Spec Paper** (#fff8e6): the technical sheet and the receipt.
- **Noon Sky** (#bfe3f5): page and stage ground before the canvas paints; the scene background.

### Named Rules
**The State Colour Rule.** Free (#3ccf74), busy (#f6c31c) and full (#ff4a3d) appear only as zone lamps, meters and scene pad tints, and only where an occupancy number can change. They are never decoration.

**The Cream On Enamel Rule.** Text on a board is cream or faded cream; on red, cream only. Grey text never sits on a coloured board.

## Typography

**Display Font:** Bungee (with system-ui)
**Body Font:** Barlow (with system-ui)
**Data Font:** JetBrains Mono (with ui-monospace)

**Character:** Bungee is a sign painter's block letter, all caps by design; Barlow is a plain, slightly narrow grotesk that reads well at length; JetBrains Mono gives plates, tallies and timers fixed-width figures.

### Hierarchy
- **Display** (400, clamp(3rem → 5.75rem), 0.95): the PARADA wordmark in the hero board only.
- **Headline** (400, clamp(1.5rem → 2.15rem), 1.06): chapter headings (h2), with a 0.06em jeep-red drop shade.
- **Title** (400, 1.2rem): step and card headings (h3), 0.05em shade.
- **Lead** (Barlow 700, 1.2rem, 1.3): the tagline line under a heading.
- **Body** (Barlow 400, 1.0625rem, 1.55): paragraphs; boards cap the measure at 34rem (54rem wide).
- **Label** (Bungee 400, 0.75–0.95rem): legends, gauge labels, `dt` in who-lists, in curb yellow on boards.
- **Data** (JetBrains Mono 500/700, tabular): zone counts, plates, session timer, speed, receipt rows, email.

### Named Rules
**The Mono Means Measured Rule.** Mono is only for counts, plates, durations and identifiers, never for a "technical" mood.

**The Painted Shade Rule.** Bungee headings carry a hard drop shade (0.05–0.06em offset, no blur) in jeep red, or deep ultramarine on red boards. This is sign lettering, not a box shadow; boxes never get a hard offset shadow.

## Layout

Each home chapter is one camera stop: a board pinned left or right (`.right`) over a full-viewport section (`min-height: 100svh`, 6rem block padding, `--gutter` sides), alternating sides through the nine pipeline steps (90svh each). The hero board (31rem) sits top-left while the camera's projection is shifted right (`shift: 0.2` of the viewport width) so the U and both gates stay clear of it. Below 768px boards drop to the bottom of their section, full width, with the scene above; the hero starts at 42svh, and tall screens use portrait camera poses with the projection shifted up instead of right. Drive mode hides the chapters (visibility, so scroll position survives), locks scroll, and lays the HUD over the canvas: objective board top-left with toasts stacked under it (above the pedals on phones), trip meter top-right, pedals on coarse pointers.

## Elevation & Depth

Depth is physical: boards hang in front of a 3D world. Each board carries a long soft drop shadow plus a tight contact shadow; buttons sit slightly proud with an inner bottom lip. No zero-offset glows, no glass.

### Shadow Vocabulary
- **Board hang** (`0 24px 44px -20px rgb(18 20 24 / 0.6), 0 3px 8px -2px rgb(18 20 24 / 0.3)`): every route board.
- **Button proud** (`0 8px 16px -8px rgb(18 20 24 / 0.65), inset 0 -3px 0 rgb(18 20 24 / 0.14)`), lifting to `0 12px 20px -10px` on hover and pressing to `0 4px 8px -6px` with an inset top lip.
- **Pinstripe** (`inset 0 0 0 9px <board>, inset 0 0 0 11px #f6c31c`): the yellow line inside every frame (6/7.5px in the HUD, 7/8.5px on phones).

## Shapes

Soft-cornered sign plates: boards 12px, buttons 9px, controls 8px, chips 6px, lamps and stop badges round. Frames are a 3px chrome gradient applied as a border-box background behind a padding-box enamel fill. Corner rivets are radial-gradient dots in a `::before` overlay. Header and footer are edged with a dashed curb stripe (`repeating-linear-gradient(90deg, #f6c31c 0 34px, #24262b 34px 46px)`, 5px).

## Components

### Buttons
- **Shape:** sign plate (9px), 2px chrome-gradient frame, 48px tall (44px small).
- **Primary:** jeep red with cream Bungee lettering and a deep-red letter shade; used for DRIVE IN, Drive again, GitHub.
- **Secondary:** cream plate with ink lettering (Watch the trip, Email); on the receipt it becomes an ultramarine plate.
- **Hover / Focus:** lifts 2px with a deeper shadow (160ms, `cubic-bezier(0.16, 1, 0.3, 1)`); presses 1px; focus is a 3px curb-yellow ring offset 3px.

### Route Board (signature)
Enamel panel (ultramarine or red) with chrome frame, inset yellow pinstripe, four rivets and the board-hang shadow. Holds a Bungee heading, Barlow body, and optional tally strip, who-list, route list or chain.

### Tally Strip
Three deep-ultramarine cells, each a state lamp (10px, band colour), the zone letter in Bungee and `occupied/capacity` in mono. Server-rendered from `lib/content.ts`, updated live by drive mode; the player's zone gets a curb inset ring in the HUD.

### Choice Chips (plate and guest policy)
Radio inputs styled as deep-ultramarine chips (44px min) with a mono hint line; selected flips to cream with ink text and a curb inset ring; keyboard focus draws the curb ring on the chip.

### Navigation
Asphalt header with the brand (red enamel P badge with chrome and yellow rings + Bungee wordmark), tabs as 44px text links in faded cream, current tab as a curb-yellow plate with ink text. A nine-lamp strip hangs under the header centre: dim lamps, amber for passed pipeline steps, the current step lit yellow and scaled 1.3; in the hero it runs one slow chase (off under reduced motion).

### Drive HUD
Smaller boards (6/7.5px pinstripe) over the canvas: plate (white plate, ink mono) and objective; trip meter with tally, session timer and km/h gauges and Leave; toasts that take the board colour of their tone (info ultramarine, ok leaf, warn curb with ink text, bad red); 72px chrome-ringed asphalt pedals on touch; a paper receipt with a dashed rule on completion.

### Spec Sheet (technical tab)
Paper panel over the dimmed campus; ultramarine TOC plates, white cards with a warm hairline, red numbered nodes for the architecture flow, mono step numbers in the journey grid.

## Do's and Don'ts

### Do:
- **Do** put every new panel on a route board (ultramarine by default, red for a warning or policy statement) with the chrome frame, pinstripe and rivets.
- **Do** keep lettering cream on enamel and ink on paper, cream or white plates.
- **Do** use curb yellow (#f6c31c) for focus, selection, the current tab and live highlights.
- **Do** set every count, plate and duration in JetBrains Mono with tabular figures, sourced from `lib/content.ts` or live drive state.
- **Do** leave the 3D campus visible: boards are 31–34rem (54rem wide) and alternate sides.

### Don't:
- **Don't** add eyebrow or kicker labels above headings; the heading carries itself.
- **Don't** put a hard offset `box-shadow` on a box; the hard shade belongs only to Bungee lettering.
- **Don't** use the free/busy/full colours anywhere a number can't change.
- **Don't** put faded cream on red boards or grey text on any enamel.
- **Don't** use emoji or Unicode glyphs as icons; icons are inline SVG at a 2.2–2.4 stroke.
