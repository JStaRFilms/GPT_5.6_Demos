import { simplexNoise3d } from "./simplex-noise";

export const prismV2VertexShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;

varying vec3 vWorldPosition;
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying float vFlow;
varying float vPulse;

${simplexNoise3d}

float fluidField(vec3 p) {
  float broad = snoise(p * 2.15 + vec3(uTime * 0.10, -uTime * 0.08, uTime * 0.06));
  float fold = snoise(p * 5.30 + broad * 0.85 + vec3(-uTime * 0.13, uTime * 0.09, 0.0));
  float skin = snoise(p * 10.2 - fold * 0.35 + vec3(0.0, -uTime * 0.18, uTime * 0.15));
  return broad * 0.62 + fold * 0.25 + skin * 0.08;
}

vec3 fluidPosition(vec3 p, vec3 n) {
  float field = fluidField(p);
  vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y, 1.25));
  float attention = pow(max(dot(normalize(p + vec3(0.001)), pointerDirection), 0.0), 5.0);
  float touch = sin(dot(p, pointerDirection) * 12.0 - uTime * 2.1) * attention * uEnergy;
  float breathing = sin(uTime * 0.78 + field * 1.8) * 0.006;
  return p + n * (field * 0.018 + touch * 0.012 + breathing);
}

void main() {
  vec3 baseNormal = normalize(normal);
  vec3 tangent = normalize(
    abs(baseNormal.z) < 0.99
      ? cross(baseNormal, vec3(0.0, 0.0, 1.0))
      : cross(baseNormal, vec3(0.0, 1.0, 0.0))
  );
  vec3 bitangent = normalize(cross(baseNormal, tangent));
  float sampleOffset = 0.008;

  vec3 displaced = fluidPosition(position, baseNormal);
  vec3 displacedTangent = fluidPosition(position + tangent * sampleOffset, baseNormal);
  vec3 displacedBitangent = fluidPosition(position + bitangent * sampleOffset, baseNormal);
  vec3 fluidNormal = normalize(cross(
    displacedTangent - displaced,
    displacedBitangent - displaced
  ));

  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPosition.xyz;
  vObjectPosition = displaced;
  vWorldNormal = normalize(mat3(modelMatrix) * fluidNormal);
  vFlow = fluidField(position);
  vPulse = 0.5 + 0.5 * sin(uTime * 1.15 + vFlow * 5.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const prismV2FragmentShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;

varying vec3 vWorldPosition;
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying float vFlow;
varying float vPulse;

vec3 spectralPalette(float t) {
  t = fract(t) * 6.0;
  vec3 coral = vec3(1.0, 0.18, 0.055);
  vec3 amber = vec3(1.0, 0.58, 0.045);
  vec3 magenta = vec3(1.0, 0.075, 0.50);
  vec3 violet = vec3(0.37, 0.12, 1.0);
  vec3 cyan = vec3(0.025, 0.72, 1.0);
  vec3 emerald = vec3(0.0, 0.67, 0.40);
  float f = smoothstep(0.05, 0.95, fract(t));
  if (t < 1.0) return mix(coral, amber, f);
  if (t < 2.0) return mix(amber, magenta, f);
  if (t < 3.0) return mix(magenta, violet, f);
  if (t < 4.0) return mix(violet, cyan, f);
  if (t < 5.0) return mix(cyan, emerald, f);
  return mix(emerald, coral, f);
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  normal = faceforward(normal, -viewDirection, normal);

  float nDotV = clamp(dot(normal, viewDirection), 0.0, 1.0);
  float fresnel = 1.0 - nDotV;
  float softFresnel = pow(fresnel, 0.72);

  float spatialWarp = vFlow * 0.28
    + dot(vObjectPosition, vec3(0.31, 0.17, -0.23))
    + sin(vObjectPosition.y * 8.0 - vObjectPosition.x * 3.5) * 0.025;
  float film = softFresnel * 1.54 + spatialWarp + uTime * 0.012;
  vec3 spectrum = spectralPalette(film * 0.72 + 0.06);
  vec3 counterSpectrum = spectralPalette(film * 0.72 + 0.42);

  float edge = pow(fresnel, 1.22);
  float ribbonSignal = 0.5 + 0.5 * sin(film * 17.5 + vFlow * 3.2);
  float ribbons = pow(ribbonSignal, 11.0) * smoothstep(0.10, 0.82, softFresnel);
  float hairline = pow(0.5 + 0.5 * sin(film * 31.0 - vFlow * 2.0), 18.0) * edge;

  vec3 blackGlass = vec3(0.004, 0.0025, 0.008);
  vec3 plumDepth = vec3(0.035, 0.009, 0.031);
  vec3 color = mix(blackGlass, plumDepth, 0.16 + fresnel * 0.21);
  color += spectrum * (edge * 0.36 + ribbons * 0.32);
  color += counterSpectrum * hairline * 0.14;

  vec3 keyLight = normalize(vec3(-0.55, 0.72, 0.85));
  vec3 rimLight = normalize(vec3(0.78, -0.18, 0.58));
  vec3 halfVector = normalize(keyLight + viewDirection);
  vec3 rimHalf = normalize(rimLight + viewDirection);
  float specular = pow(max(dot(normal, halfVector), 0.0), 92.0);
  float softSpecular = pow(max(dot(normal, halfVector), 0.0), 21.0);
  float sideSpecular = pow(max(dot(normal, rimHalf), 0.0), 54.0);

  color += vec3(1.0, 0.58, 0.72) * specular * 0.78;
  color += spectrum * softSpecular * 0.13;
  color += vec3(0.30, 0.68, 1.0) * sideSpecular * 0.18;

  float ember = pow(max(0.0, sin(film * 12.5 + 1.1)), 20.0);
  color += vec3(1.0, 0.15, 0.018) * ember * edge * 0.32;
  color += spectrum * vPulse * uEnergy * ribbons * 0.09;
  color += counterSpectrum * pow(fresnel, 5.2) * 0.52;

  float pointerGlow = pow(max(dot(normalize(vObjectPosition + vec3(0.001)), normalize(vec3(uPointer, 1.2))), 0.0), 10.0);
  color += spectrum * pointerGlow * uEnergy * 0.028;

  color = color / (color + vec3(0.82));
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
