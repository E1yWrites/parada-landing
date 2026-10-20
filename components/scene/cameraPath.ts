// Camera stops. Every element with data-cam="<key>" in the page is one stop; scrolling through the stops moves
// the camera between them. Coordinates are scene metres (see layout.ts). Pipeline stops follow the demo car.
type V3 = [number, number, number];
export type CamStop = {
  pos: V3; // static pose (also the fallback for follow stops)
  look: V3;
  dim?: number;
  // slide the subject away from the board: + right (board on the left), − left (board on the right); tall screens slide it up
  shift?: number;
  tallShift?: number; // tall screens' upward slide, when it must differ from |shift|
  // pose used on tall screens (before the portrait pull-back)
  portrait?: { pos: V3; look: V3 };
  // follow the demo car: off is in the car's frame (x right, y up, z forward); the gaze can lean toward `look`
  follow?: { off: V3; ahead?: number; look?: V3; mix?: number };
};

// Points the tour explains, shared with Pipeline.tsx
export const POI = {
  plate: [-65.6, 3.3, -57.2] as V3, // the lifted plate, in front of the car waiting under the canopy
  api: [-46, 22, -47] as V3, // above the JPL Building's west wing
  receipt: [-4, 10.5, -60] as V3, // over the north gate, where the exit camera closed the session
};

export const CAM: Record<string, CamStop> = {
  intro: { pos: [-60, 150, -200], look: [-10, 0, 10], shift: 0.2, portrait: { pos: [-150, 70, -140], look: [-30, 0, -36] } }, // behind the title
  // PARADA at a glance: the four sideways panels truck the camera west to east along the campus's north side
  hero: { pos: [-75, 120, -170], look: [-45, 0, 20], shift: 0.2, portrait: { pos: [-150, 70, -140], look: [-30, 0, -36] } },
  about: { pos: [-35, 120, -170], look: [-15, 0, 20], shift: -0.2 },
  drivers: { pos: [5, 120, -170], look: [15, 0, 20], shift: 0.2 },
  admins: { pos: [45, 120, -170], look: [45, 0, 20], shift: -0.2 },
  // the defense: each slide frames what it talks about
  background: { pos: [-20, 290, 300], look: [-5, 0, 35], shift: -0.24 }, // the whole campus, numbered as on the map
  problem: { pos: [-95, 26, 30], look: [-63, 1, -12], shift: 0.2 }, // the avenue's bays
  prior: { pos: [-82, 60, -20], look: [-64, 0, -8], shift: -0.25 }, // bays from above: one sensor each
  sensors: { pos: [-48, 22, 8], look: [-66, 0, -14], shift: 0.2 },
  cameras: { pos: [-104, 24, -96], look: [-70, 3, -62], shift: -0.25 }, // the main-gate canopy
  insight: { pos: [-58, 22, -28], look: [-72, 3, -62], shift: 0.2 }, // the entry camera from inside Zone A
  interview: { pos: [-30, 70, 150], look: [22, 4, 78], shift: -0.25 }, // the Administration Building
  objectives: { pos: [170, 150, -120], look: [0, 0, 0], shift: 0.25 },
  scope: { pos: [-30, 190, -150], look: [-30, 0, -15], shift: -0.25 }, // Zone A, the one zone modelled
  method: { pos: [40, 70, -130], look: [-20, 4, -30], shift: 0.25 },
  context: { pos: [20, 60, 90], look: [-25, 2, 25], shift: -0.25 },
  arch: { pos: [40, 180, 230], look: [0, 0, 20], shift: 0.25 },
  how: { pos: [-118, 46, -112], look: [-62, 2, -54], shift: -0.18, portrait: { pos: [-112, 38, -96], look: [-64, 2, -52] } }, // the entry corner, before the tour begins
  // the pipeline: the camera rides with the car, from Tolentino Rd through both of Zone A's gates
  arrive: { pos: [-100, 14, -40], look: [-66, 2, -58], shift: 0.16, follow: { off: [-9, 15, -19], ahead: 12 } },
  camera: { pos: [-60, 5, -54], look: [-68, 2, -60], shift: -0.16, follow: { off: [0.6, 3, 8.6], ahead: 1 } },
  ocr: { pos: [-62, 4, -54], look: POI.plate, shift: 0.16, follow: { off: [0.9, 3.2, 9], look: POI.plate, mix: 1 } },
  api: { pos: [-74, 20, -80], look: POI.api, shift: -0.16, follow: { off: [-14, 20, -24], look: POI.api, mix: 0.6 } },
  resolve: { pos: [-71, 21, -71], look: POI.api, shift: 0.16, follow: { off: [-4, 26, -14], look: POI.api, mix: 0.9 } },
  occupancy: { pos: [-58, 7, -62], look: [-61, 2, -40], shift: -0.16, follow: { off: [0, 4.2, -11.5], ahead: 10 } },
  // the car parked nose-in under the avenue trees, seen from the driveway; the app screens are in the page beside it
  clients: { pos: [-56, 8, -18], look: [-67, 1, -22], shift: -0.07, tallShift: 0.3, follow: { off: [5, 10, -17], ahead: 0 } },
  exit: { pos: [7.5, 6.5, -47], look: [3.5, 2, -64], shift: -0.16, follow: { off: [0, 6, -12.5], ahead: 6 } },
  fee: { pos: [-26, 13, -84], look: [-1, 6, -65], shift: 0.16, portrait: { pos: [-6, 13, -90], look: [-4, 7, -62] } },
  results: { pos: [60, 60, -130], look: [5, 4, -60], shift: -0.25 }, // the north gate, where the session closed
  limits: { pos: [-96, 9, -78], look: [-72, 3, -63], shift: 0.25 }, // the entry camera's view of the canopy
  conclusion: { pos: [-40, 230, 260], look: [0, 0, 10], shift: -0.25 },
  play: { pos: [-150, 110, -150], look: [-18, 0, 0], shift: 0.2 },
  contact: { pos: [0, 200, 250], look: [0, 0, 20], dim: 0.55 },
  tech: { pos: [0, 170, 230], look: [0, 0, 20], dim: 0.72 },
};
