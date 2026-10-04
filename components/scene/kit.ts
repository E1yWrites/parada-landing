// Kenney models (CC0), each kit baked into one meshopt-compressed GLB (public/models/CREDITS.txt):
// cars from the Car Kit; street tiles, paving, buildings, trees, lampposts and the fountain from the City Builder kit.
// Each model is flattened to a single float geometry so repeats render as one InstancedMesh per model.
import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const CARS_URL = '/models/cars.glb';
export const CITY_URL = '/models/city.glb';
export const PLAYER_MODEL = 'hatchback-sports';
export const PARKED_MODELS = ['sedan', 'suv', 'taxi', 'van', 'sedan-sports', 'suv-luxury', 'delivery'] as const;
export const CITY_MODELS = [
  'building-small-a', 'building-small-b', 'building-small-c', 'building-small-d', 'building-garage',
  'grass-trees', 'grass-trees-tall', 'pavement-fountain', 'road-straight-lightposts',
  'road-straight', 'road-corner', 'road-split', 'pavement',
] as const;
export type CityModel = (typeof CITY_MODELS)[number];
export const CAR_LENGTH = 4.3; // metres, nose along +z
export const TILE = 10; // metres per City Builder tile (models are 1 unit square)

// City tiles carry their own grass/road slab (top at y≈0.06); the campus draws its own ground.
const SLAB_CUT: Partial<Record<CityModel, number>> = { 'grass-trees': 0.065, 'grass-trees-tall': 0.065, 'road-straight-lightposts': 0.06 };

// Quantized attributes can't hold transformed values, so copy to Float32 first.
const toFloat = (g: THREE.BufferGeometry) => {
  for (const name of Object.keys(g.attributes)) {
    const a = g.getAttribute(name) as THREE.BufferAttribute;
    if (a.array instanceof Float32Array && !a.normalized) continue;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    g.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
  }
  return g;
};

// Merge a model's meshes into one geometry in the model's own units. `cut` drops every triangle
// lying entirely at or below that height (the ground slab of a city tile).
const flatten = (root: THREE.Object3D, cut = -Infinity) => {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const parts: THREE.BufferGeometry[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    let g = toFloat(m.geometry.clone());
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.index) g = g.toNonIndexed().setIndex([...Array(g.getAttribute('position').count).keys()]);
    parts.push(g);
  });
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  if (cut > -Infinity) {
    const y = merged.getAttribute('position');
    const idx = merged.index!.array;
    const keep: number[] = [];
    for (let i = 0; i < idx.length; i += 3) {
      if (Math.max(y.getY(idx[i]), y.getY(idx[i + 1]), y.getY(idx[i + 2])) > cut) keep.push(idx[i], idx[i + 1], idx[i + 2]);
    }
    merged.setIndex(keep);
  }
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
};

// Cars: real size, centred, wheels on the ground.
const fitCar = (g: THREE.BufferGeometry) => {
  const b = g.boundingBox!;
  const s = CAR_LENGTH / (b.max.z - b.min.z);
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(s, s, s);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
};

const kitMaterial = (scene: THREE.Object3D) => {
  const m = (scene.getObjectByProperty('isMesh', true) as THREE.Mesh).material as THREE.MeshStandardMaterial;
  m.roughness = 0.6;
  m.metalness = 0;
  return m;
};

export function useCars() {
  const gltf = useGLTF(CARS_URL, false);
  const out = useMemo(() => {
    const byName = (n: string) => gltf.scene.getObjectByName(n)!;
    const material = kitMaterial(gltf.scene);
    material.roughness = 0.55;
    const geos = Object.fromEntries(PARKED_MODELS.map((n) => [n, fitCar(flatten(byName(n)))])) as Record<(typeof PARKED_MODELS)[number], THREE.BufferGeometry>;
    const player = fitCar(flatten(byName(PLAYER_MODEL)));
    return { material, geos, player };
  }, [gltf]);
  useEffect(() => () => {
    Object.values(out.geos).forEach((g) => g.dispose());
    out.player.dispose();
  }, [out]);
  return out;
}

// City pieces in tile units (1 = TILE metres when instanced at scale TILE).
export function useCity() {
  const gltf = useGLTF(CITY_URL, false);
  const out = useMemo(() => {
    const material = kitMaterial(gltf.scene);
    const geos = Object.fromEntries(CITY_MODELS.map((n) => [n, flatten(gltf.scene.getObjectByName(n)!, SLAB_CUT[n])])) as Record<CityModel, THREE.BufferGeometry>;
    return { material, geos };
  }, [gltf]);
  useEffect(() => () => Object.values(out.geos).forEach((g) => g.dispose()), [out]);
  return out;
}

useGLTF.preload(CARS_URL, false);
useGLTF.preload(CITY_URL, false);
