// Camera stops. Every element with data-cam="<key>" in the page is one stop; scrolling
// through the stops moves the camera between them. Coordinates are scene metres (see Lot).
type V3 = [number, number, number];
export type CamStop = { pos: V3; look: V3; dim?: number; orbit?: boolean; still?: boolean };

export const CAM: Record<string, CamStop> = {
  hero: { pos: [0, 46, 72], look: [0, 0, -10], orbit: true },
  about: { pos: [-6, 78, 30], look: [0, 0, -12] },
  problem: { pos: [52, 30, 48], look: [4, 0, -10] },
  arrive: { pos: [-8, 9, 26], look: [-32, 1, 6] },
  camera: { pos: [-22, 6, 13], look: [-31, 3.5, 2] },
  ocr: { pos: [-29.5, 2.2, 8.5], look: [-32, 1, 4.6] },
  api: { pos: [-16, 20, 28], look: [-32, 8, -2] },
  resolve: { pos: [-14, 14, 24], look: [-32, 5, -2] },
  occupancy: { pos: [-32, 34, 22], look: [-32, 0, -8] },
  clients: { pos: [-6, 12, 30], look: [-20, 5, 2] },
  exit: { pos: [-46, 8, 18], look: [-34, 1, 4] },
  fee: { pos: [-30, 10, 22], look: [-32, 4, 2] },
  guest: { pos: [-32, 17, 26], look: [-32, 2, 1] },
  play: { pos: [0, 58, 56], look: [0, 0, -8] },
  apps: { pos: [26, 12, 32], look: [8, 3, 6] },
  arch: { pos: [0, 52, 64], look: [0, 0, -4] },
  contact: { pos: [0, 90, 96], look: [0, 0, -10], dim: 0.6, still: true },
  tech: { pos: [0, 70, 84], look: [0, 0, -6], dim: 0.72, still: true },
};
