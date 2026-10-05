// The world fades out at its edge instead of stopping in mid-air: three's fog chunks gain a radial term, so every
// fogged material (ground, streets, buildings, houses, trees, wires) dissolves into the fog colour, which matches the
// sky, between EDGE_NEAR and EDGE_FAR metres from the campus centre. Camera-distance fog still applies on top.
// Imported once by Scene before any material compiles.
import * as THREE from 'three';

export const EDGE_CENTER: [number, number] = [0, 25]; // campus centre, scene metres
const EDGE_NEAR = 175;
const EDGE_FAR = 255;

THREE.ShaderChunk.fog_pars_vertex = /* glsl */ `
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec2 vFogWorld;
#endif
`;
THREE.ShaderChunk.fog_vertex = /* glsl */ `
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vec4 fogWorld = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    fogWorld = instanceMatrix * fogWorld;
  #endif
  vFogWorld = ( modelMatrix * fogWorld ).xz;
#endif
`;
THREE.ShaderChunk.fog_pars_fragment = /* glsl */ `
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec2 vFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif
`;
THREE.ShaderChunk.fog_fragment = /* glsl */ `
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  float edgeFade = smoothstep( ${EDGE_NEAR.toFixed(1)}, ${EDGE_FAR.toFixed(1)}, distance( vFogWorld, vec2( ${EDGE_CENTER[0].toFixed(1)}, ${EDGE_CENTER[1].toFixed(1)} ) ) );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, max( fogFactor, edgeFade ) );
#endif
`;
