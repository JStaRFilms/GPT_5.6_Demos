import { simplexNoise3d } from "./simplex-noise";

export const prismV1VertexShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;

varying vec3 vWorldPosition;
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying float vNoise;

${simplexNoise3d}

float shape(vec3 p) {
  float broad = snoise(p * 0.78 + vec3(uTime * 0.10, -uTime * 0.07, uTime * 0.05));
  float fold = snoise(p * 1.72 - vec3(uTime * 0.12, 0.0, -uTime * 0.10));
  return broad * 0.34 + fold * 0.07;
}

vec3 deform(vec3 p) {
  vec3 direction = normalize(p);
  vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y, 1.15));
  float focus = pow(max(dot(direction, pointerDirection), 0.0), 5.0);
  float wave = sin(dot(p, pointerDirection) * 5.0 - uTime * 2.0);
  float displacement = shape(p) + sin(uTime * 0.8) * 0.025;
  displacement += focus * uEnergy * (0.08 + wave * 0.03);
  return p + direction * displacement;
}

void main() {
  vec3 displaced = deform(position);
  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPosition.xyz;
  vObjectPosition = displaced;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vNoise = shape(position);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const prismV1FragmentShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;

varying vec3 vWorldPosition;
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying float vNoise;

vec3 spectrum(float t) {
  return 0.52 + 0.48 * cos(6.2831853 * (t + vec3(0.00, 0.33, 0.67)));
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  normal = faceforward(normal, -viewDirection, normal);
  float fresnel = 1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0);
  float phase = pow(fresnel, 0.72) * 1.45 + vNoise * 0.55 + vObjectPosition.y * 0.06;
  vec3 oil = spectrum(phase);
  float edge = pow(fresnel, 1.5);
  float ribbons = pow(0.5 + 0.5 * sin(phase * 19.0), 14.0) * edge;
  vec3 color = vec3(0.004, 0.003, 0.009);
  color += vec3(0.033, 0.014, 0.038) * fresnel * 0.42;
  color += oil * (edge * 0.15 + ribbons * 0.08);
  vec3 lightDirection = normalize(vec3(-0.55, 0.8, 0.75));
  vec3 halfVector = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(normal, halfVector), 0.0), 68.0);
  color += vec3(1.0, 0.56, 0.7) * specular * 0.42;
  color += spectrum(phase + 0.18) * pow(fresnel, 5.0) * 0.18;
  color += oil * ribbons * uEnergy * 0.05;
  color = color / (color + vec3(0.88));
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
