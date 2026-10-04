// Camera stops. Every element with data-cam="<key>" in the page is one stop; scrolling
// through the stops moves the camera between them. Coordinates are scene metres (see layout.ts).
import { DEMO_SLOT } from './layout';

type V3 = [number, number, number];
// shift: on wide screens, slide the projection so the look target sits right of centre (fraction of width),
// leaving the left side to the route board.
// portrait: pose used on tall screens (before the portrait pull-back), where the wide framing would
// crop the gates or put the camera inside the shophouses across the street.
export type CamStop = { pos: V3; look: V3; dim?: number; orbit?: boolean; still?: boolean; shift?: number; portrait?: { pos: V3; look: V3 } };

export const CAM: Record<string, CamStop> = {
  hero: { pos: [-20, 150, 158], look: [0, 0, 6], orbit: true, shift: 0.2, portrait: { pos: [95, 30, 50], look: [-10, 0, 40] } },
  about: { pos: [0, 150, 44], look: [0, 0, -14] },
  problem: { pos: [112, 52, 84], look: [8, 0, -10] },
  // pipeline, following the demo car from ENTRY round the U to EXIT
  arrive: { pos: [-78, 6, 57.5], look: [-52, 2, 46], portrait: { pos: [-64, 5, 54], look: [-52, 2, 46] } },
  camera: { pos: [-30, 9, 62], look: [-46, 3.5, 43], portrait: { pos: [-32, 9, 58], look: [-46, 3.5, 43] } },
  ocr: { pos: [-46.5, 3.6, 35.5], look: [-48, 3.3, 42.6] },
  api: { pos: [-8, 27, 62], look: [-34, 12, 35] },
  resolve: { pos: [-17, 22, 47], look: [-33, 15, 30] },
  occupancy: { pos: [DEMO_SLOT.x - 18, 24, DEMO_SLOT.z + 8], look: [DEMO_SLOT.x + 2, 0, DEMO_SLOT.z - 1] },
  clients: { pos: [-20, 20, 53], look: [-33, 14, 33] },
  exit: { pos: [66, 9, 57], look: [48, 2, 40], portrait: { pos: [58, 8, 50], look: [48, 2, 40] } },
  fee: { pos: [58, 12, 58], look: [43, 6, 39], portrait: { pos: [50, 19, 56], look: [35, 7, 37] } },
  guest: { pos: [-72, 22, 58], look: [-48, 3, 42] },
  play: { pos: [0, 86, 116], look: [0, 0, -8] },
  apps: { pos: [-24, 18, 53], look: [-33, 14, 33] },
  arch: { pos: [10, 110, 130], look: [0, 0, -10] },
  contact: { pos: [0, 125, 140], look: [0, 0, -12], dim: 0.55, still: true },
  tech: { pos: [0, 105, 130], look: [0, 0, -12], dim: 0.72, still: true },
};
