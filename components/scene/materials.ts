// Surface variation without texture downloads: world-space value noise mottles a material's colour, so concrete,
// plaster, roofs, lawn and asphalt read as weathered surfaces instead of flat fills. `scale` is the blotch size
// in metres; `amount` how far the colour swings either way.
import * as THREE from 'three';

const NOISE = /* glsl */ `
varying vec3 vWorldPos;
float hash3(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.7, 51.3))) * 43758.5453); }
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return vnoise(p) * 0.55 + vnoise(p * 2.7) * 0.3 + vnoise(p * 7.9) * 0.15; }
`;

export function weathered<M extends THREE.MeshStandardMaterial>(mat: M, amount = 0.15, scale = 2.5): M {
  mat.onBeforeCompile = (s) => {
    s.uniforms.uWeather = { value: new THREE.Vector2(amount, 1 / scale) };
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
        #endif
        vWorldPos = (modelMatrix * wp).xyz;`,
      );
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec2 uWeather;\n${NOISE}`)
      .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb *= 1.0 + uWeather.x * (fbm(vWorldPos * uWeather.y) * 2.0 - 1.0);');
  };
  mat.customProgramCacheKey = () => `weathered-${amount}-${scale}`;
  return mat;
}
