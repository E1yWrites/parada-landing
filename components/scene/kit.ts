// Cars, a motorcycle and the rain-tree stand-in, baked into one meshopt-compressed GLB (public/models/CREDITS.txt).
// Each prop is flattened to a single float geometry with its material colours baked into vertex colours, so every
// prop shares one material and repeats render as one InstancedMesh per model.
import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const PROPS_URL = '/models/props.glb';
// Parked cars in the colours a campus lot actually holds; the player's car is ID blue, like the Registered pass.
const CARS = {
  sedan: { node: 'sedan', len: 4.45, body: '#b6bbc0' }, // silver
  suv: { node: 'suv', len: 4.6, body: '#ecebe7' }, // white
  dark: { node: 'taxi', len: 4.4, body: '#2c3036' }, // the taxi body, repainted pearl black
  hatch: { node: 'hatchback', len: 3.9, body: '#9e2d2a' }, // red
} as const;
export const PARKED_MODELS = Object.keys(CARS) as (keyof typeof CARS)[];
const PLAYER = { node: 'sedan', len: 4.45, body: '#2a5db0' };
const MOTORCYCLE = { node: 'motorcycle', len: 1.95 };
// the painted body panels in each source model, by material name
const body = (c: string) => ({ Blue: c, LightBlue: c, White: c, Yellow: c });

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

// Merge a model's meshes into one geometry in the model's own units, each mesh's colour (or its repaint, by material
// name) in its vertices.
const flatten = (root: THREE.Object3D, paint: Record<string, string> = {}, only?: string) => {
  root.updateMatrixWorld(true);
  const inv = (root.parent ?? root).matrixWorld.clone().invert(); // keep the prop node's own turn (the motorcycle's)
  const parts: THREE.BufferGeometry[] = [];
  const col = new THREE.Color();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (only && mat.name !== only) return;
    let g = toFloat(m.geometry.clone());
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal'].includes(k)) g.deleteAttribute(k);
    if (!g.index) g = g.toNonIndexed().setIndex([...Array(g.getAttribute('position').count).keys()]);
    if (paint[mat.name]) col.set(paint[mat.name]);
    else col.copy(mat.color);
    const n = g.getAttribute('position').count;
    const c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.toArray(c, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    parts.push(g);
  });
  const merged = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return merged;
};

// Real size, centred, wheels on the ground, nose along +z.
const fit = (g: THREE.BufferGeometry, len: number) => {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const s = len / (b.max.z - b.min.z);
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(s, s, s);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
};

// The tree as a rain tree: crown spread 1 each way, 0.62 tall (the model is an acacia, lopsided and taller),
// trunk base at the origin. Crown and trunk come apart so only the crown takes each tree's leaf tint.
const treeParts = (root: THREE.Object3D) => {
  const all = flatten(root);
  all.computeBoundingBox();
  const b = all.boundingBox!;
  all.dispose();
  const fitTree = (g: THREE.BufferGeometry) => {
    g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(1 / (b.max.x - b.min.x), 0.62 / (b.max.y - b.min.y), 1 / (b.max.z - b.min.z));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  };
  return { crown: fitTree(flatten(root, { Leaves: '#ffffff' }, 'Leaves')), trunk: fitTree(flatten(root, { Tree: '#6b5644' }, 'Tree')) };
};

export function useProps() {
  const gltf = useGLTF(PROPS_URL, false);
  const out = useMemo(() => {
    const byName = (n: string) => gltf.scene.getObjectByName(n)!;
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.1 });
    const geos = Object.fromEntries(PARKED_MODELS.map((k) => [k, fit(flatten(byName(CARS[k].node), body(CARS[k].body)), CARS[k].len)])) as Record<keyof typeof CARS, THREE.BufferGeometry>;
    const player = fit(flatten(byName(PLAYER.node), body(PLAYER.body)), PLAYER.len);
    const motorcycle = fit(flatten(byName(MOTORCYCLE.node)), MOTORCYCLE.len);
    const tree = treeParts(byName('tree'));
    return { material, geos, player, motorcycle, tree };
  }, [gltf]);
  useEffect(
    () => () => {
      Object.values(out.geos).forEach((g) => g.dispose());
      [out.player, out.motorcycle, out.tree.crown, out.tree.trunk].forEach((g) => g.dispose());
      out.material.dispose();
    },
    [out],
  );
  return out;
}

useGLTF.preload(PROPS_URL, false);
