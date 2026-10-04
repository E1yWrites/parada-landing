// Camera stops. Every element with data-cam="<key>" in the page is one stop; scrolling through the stops moves
// the camera between them. Coordinates are scene metres (see layout.ts). Pipeline stops follow the demo car.
type V3 = [number, number, number];
export type CamStop = {
  pos: V3; // static pose (also the fallback for follow stops)
  look: V3;
  dim?: number;
  orbit?: boolean;
  still?: boolean;
  // slide the subject away from the board: + right (board on the left), − left (board on the right); tall screens slide it up
  shift?: number;
  // pose used on tall screens (before the portrait pull-back)
  portrait?: { pos: V3; look: V3 };
  // follow the demo car: off is in the car's frame (x right, y up, z forward); the gaze can lean toward `look`
  follow?: { off: V3; ahead?: number; look?: V3; mix?: number };
};

// Points the tour explains, shared with Pipeline.tsx
export const POI = {
  plate: [-65.6, 3.3, -57.2] as V3, // the lifted plate, in front of the car waiting under the canopy
  api: [-46, 22, -47] as V3, // above the JPL Building's west wing
  phone: [-62.5, 12.5, -31] as V3, // the clients hover over the avenue, beside the parked car
  laptop: [-58.5, 12, -25] as V3,
  devices: [-60.5, 12.2, -28] as V3,
  receipt: [-4, 10.5, -60] as V3, // over the north gate, where the exit camera closed the session
};

export const CAM: Record<string, CamStop> = {
  hero: { pos: [-60, 150, -200], look: [-10, 0, 10], orbit: true, shift: 0.2, portrait: { pos: [-150, 70, -140], look: [-30, 0, -36] } },
  about: { pos: [10, 250, 70], look: [4, 0, 36], shift: -0.2 },
  problem: { pos: [150, 85, 140], look: [-6, 0, 20] },
  // the pipeline: the camera rides with the car, from Tolentino Rd through both of Zone A's gates
  arrive: { pos: [-100, 14, -40], look: [-66, 2, -58], shift: 0.16, follow: { off: [-9, 15, -19], ahead: 12 } },
  camera: { pos: [-60, 5, -54], look: [-68, 2, -60], shift: -0.16, follow: { off: [0.6, 3, 8.6], ahead: 1 } },
  ocr: { pos: [-62, 4, -54], look: POI.plate, shift: 0.16, follow: { off: [0.9, 3.2, 9], look: POI.plate, mix: 1 } },
  api: { pos: [-74, 20, -80], look: POI.api, shift: -0.16, follow: { off: [-14, 20, -24], look: POI.api, mix: 0.6 } },
  resolve: { pos: [-71, 21, -71], look: POI.api, shift: 0.16, follow: { off: [-4, 26, -14], look: POI.api, mix: 0.9 } },
  occupancy: { pos: [-58, 7, -62], look: [-61, 2, -40], shift: -0.16, follow: { off: [0, 4.2, -11.5], ahead: 10 } },
  clients: { pos: [-83, 11, -26], look: POI.devices, shift: 0.16, follow: { off: [4, 14, 20], look: POI.devices, mix: 0.85 } },
  exit: { pos: [7.5, 6.5, -47], look: [3.5, 2, -64], shift: -0.16, follow: { off: [0, 6, -12.5], ahead: 6 } },
  fee: { pos: [-26, 13, -84], look: [-1, 6, -65], shift: 0.16, portrait: { pos: [-6, 13, -90], look: [-4, 7, -62] } },
  guest: { pos: [-104, 20, -46], look: [-66, 3, -58], shift: -0.2, portrait: { pos: [-92, 14, -62], look: [-66, 3, -58] } },
  play: { pos: [-150, 110, -150], look: [-18, 0, 0], shift: 0.2 },
  apps: { pos: [-86, 16, -30], look: POI.devices, shift: -0.2 },
  arch: { pos: [40, 180, 230], look: [0, 0, 20] },
  contact: { pos: [0, 200, 250], look: [0, 0, 20], dim: 0.55, still: true },
  tech: { pos: [0, 170, 230], look: [0, 0, 20], dim: 0.72, still: true },
};
