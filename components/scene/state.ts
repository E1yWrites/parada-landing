// Shared, non-React state between the camera rig and scene parts (read every frame).
export const scroll = {
  t: 0, // float index into `keys`: 3.4 = 40% of the way from stop 3 to stop 4
  keys: [] as string[],
};

export const stopIndex = (key: string) => scroll.keys.indexOf(key);

// 0..1 weight for "near this stop", used to fade per-chapter effects in and out.
export const near = (key: string, radius = 0.75) => {
  const i = stopIndex(key);
  if (i < 0) return 0;
  return Math.max(0, 1 - Math.abs(scroll.t - i) / radius);
};

// Animated gate parts (0..1). Written by the scroll pipeline or by drive mode, drawn by <Gates>.
export const gates = { entryBoom: 0, entryCone: 0, exitSlide: 0, exitCone: 0 };
