// Camera stops. Every element with data-cam="<key>" in the page is one stop; scrolling
// through the stops moves the camera between them. Coordinates are scene metres (see layout.ts).
type V3 = [number, number, number];
export type CamStop = { pos: V3; look: V3; dim?: number; orbit?: boolean; still?: boolean };

export const CAM: Record<string, CamStop> = {
  hero: { pos: [4, 92, 116], look: [4, 0, 26], orbit: true },
  about: { pos: [8, 135, 46], look: [8, 0, -12] },
  problem: { pos: [80, 46, 72], look: [8, 0, -10] },
  // pipeline, following the demo car from the main gate to the exit gate
  arrive: { pos: [-82, 8, 34], look: [-62, 1.5, 18] },
  camera: { pos: [-70, 7, 30], look: [-60, 2.5, 19] },
  ocr: { pos: [-66, 3.8, 27.5], look: [-61.5, 3.4, 21] },
  api: { pos: [-30, 28, 34], look: [-46, 14, 6] },
  resolve: { pos: [-36, 27, 24], look: [-46, 17, 2] },
  occupancy: { pos: [-34, 42, 54], look: [-34, 0, 18] },
  clients: { pos: [-37, 24, 36], look: [-44, 15, 5] },
  exit: { pos: [56, 12, -6], look: [70, 1.5, -26] },
  fee: { pos: [54, 15, -8], look: [64, 7, -22] },
  guest: { pos: [-80, 20, 44], look: [-60, 2, 18] },
  play: { pos: [8, 90, 100], look: [8, 0, -12] },
  apps: { pos: [-30, 20, 28], look: [-36, 15, 5] },
  arch: { pos: [8, 110, 120], look: [8, 0, -10] },
  contact: { pos: [8, 120, 130], look: [8, 0, -12], dim: 0.6, still: true },
  tech: { pos: [8, 100, 120], look: [8, 0, -12], dim: 0.72, still: true },
};
