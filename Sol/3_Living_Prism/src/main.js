import * as THREE from "three";
import "./styles.css";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform vec2 uPointer;

  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying float vNoise;

  vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(
      dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)
    ));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(
      dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)
    ), 0.0);
    m *= m;
    return 42.0 * dot(m * m, vec4(
      dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)
    ));
  }

  float organicField(vec3 p) {
    float t = uTime;
    vec3 q = p * 0.67;
    float broad = snoise(q * 1.18 + vec3(t * 0.13, -t * 0.10, t * 0.08));
    float folds = snoise(q * 2.65 + vec3(-t * 0.20, t * 0.16, t * 0.09));
    float skin = snoise(q * 5.1 + broad * 0.75 - vec3(t * 0.28, 0.0, -t * 0.21));
    float lobe = sin(q.x * 2.1 - q.y * 1.7 + q.z * 1.4 + broad * 2.2 + t * 0.34);
    return broad * 0.36 + folds * 0.06 + skin * 0.008 + lobe * 0.065;
  }

  vec3 displacePosition(vec3 p) {
    vec3 direction = normalize(p);
    vec3 pointerDirection = normalize(vec3(uPointer.x * 0.95, uPointer.y * 0.95, 1.15));
    float focus = pow(max(dot(direction, pointerDirection), 0.0), 5.0);
    float travellingWave = sin(dot(p, pointerDirection) * 5.0 - uTime * 2.25);
    float breath = sin(uTime * 0.86) * 0.035;
    float displacement = organicField(p) + breath;
    displacement += focus * uEnergy * (0.12 + travellingWave * 0.045);
    return p + direction * displacement;
  }

  void main() {
    vec3 baseNormal = normalize(normal);
    vec3 tangent = normalize(
      abs(baseNormal.z) < 0.99
        ? cross(baseNormal, vec3(0.0, 0.0, 1.0))
        : cross(baseNormal, vec3(0.0, 1.0, 0.0))
    );
    vec3 bitangent = normalize(cross(baseNormal, tangent));
    float offset = 0.018;

    vec3 displaced = displacePosition(position);
    vec3 displacedTangent = displacePosition(position + tangent * offset);
    vec3 displacedBitangent = displacePosition(position + bitangent * offset);
    vec3 deformedNormal = normalize(cross(
      displacedTangent - displaced,
      displacedBitangent - displaced
    ));

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    vObjectPosition = displaced;
    vWorldNormal = normalize(mat3(modelMatrix) * deformedNormal);
    vNoise = organicField(position);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;

  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying float vNoise;

  vec3 spectrum(float t) {
    vec3 phase = vec3(0.00, 0.33, 0.67);
    return 0.52 + 0.48 * cos(6.2831853 * (t + phase));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    normal = faceforward(normal, -viewDirection, normal);

    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float fresnel = 1.0 - facing;
    float softFresnel = pow(fresnel, 0.72);

    float warp = vNoise * 1.15
      + sin(vObjectPosition.y * 1.45 - vObjectPosition.x * 0.72) * 0.10
      + sin(vObjectPosition.z * 2.25 + uTime * 0.13) * 0.055;
    float phase = softFresnel * 1.55 + warp + vObjectPosition.y * 0.055;
    vec3 oil = spectrum(phase);
    oil = pow(max(oil, 0.0), vec3(1.08));

    float edge = pow(fresnel, 1.55);
    float ribbonWave = 0.5 + 0.5 * sin(
      softFresnel * 25.0 + warp * 8.5 - vObjectPosition.y * 1.05
    );
    float ribbons = pow(ribbonWave, 15.0) * smoothstep(0.24, 0.88, softFresnel);

    vec3 deepBlack = vec3(0.004, 0.003, 0.008);
    vec3 plumSkin = vec3(0.038, 0.017, 0.041);
    vec3 color = mix(deepBlack, plumSkin, 0.13 + 0.17 * fresnel);
    color += oil * (edge * 0.155 + ribbons * 0.09);

    float warmSeam = pow(max(0.0, sin(phase * 11.0 + 1.3)), 18.0);
    color += vec3(1.0, 0.11, 0.018) * warmSeam * (0.008 + edge * 0.10);

    vec3 keyLight = normalize(vec3(-0.55, 0.82, 0.72));
    vec3 fillLight = normalize(vec3(0.72, -0.20, 0.58));
    vec3 halfVector = normalize(keyLight + viewDirection);
    float key = max(dot(normal, keyLight), 0.0);
    float fill = max(dot(normal, fillLight), 0.0);
    float specular = pow(max(dot(normal, halfVector), 0.0), 74.0);
    float wideSpecular = pow(max(dot(normal, halfVector), 0.0), 15.0);

    color += vec3(1.0, 0.56, 0.68) * specular * 0.46;
    color += oil * wideSpecular * 0.05;
    color += vec3(0.08, 0.25, 0.36) * fill * 0.025;
    color += vec3(0.13, 0.025, 0.012) * key * 0.025;

    float livingPulse = 0.5 + 0.5 * sin(uTime * 1.45 + vNoise * 8.0);
    color += oil * livingPulse * uEnergy * ribbons * 0.075;
    color += spectrum(phase + 0.18) * pow(fresnel, 5.5) * 0.18;

    color = color / (color + vec3(0.88));
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const container = document.querySelector("#scene");
const statusText = document.querySelector("#statusText");
const motionToggle = document.querySelector("#motionToggle");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let renderer;
let scene;
let camera;
let organism;
let animationFrame;
let isPaused = reducedMotionQuery.matches;
let pointerIsDown = false;
let elapsed = 0;
let previousTime = performance.now();

const pointer = new THREE.Vector2(0, 0);
const pointerTarget = new THREE.Vector2(0, 0);
const rotationTarget = new THREE.Vector2(0, 0);
const clockVelocity = { energy: 0.22 };

const uniforms = {
  uTime: { value: 0 },
  uEnergy: { value: 0.22 },
  uPointer: { value: pointer },
};

function webGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function createOrganism() {
  const geometry = new THREE.SphereGeometry(2.12, 192, 128);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(1.08, 1.0, 1.03);
  mesh.rotation.set(-0.18, 0.46, -0.12);
  return mesh;
}

function setResponsiveComposition() {
  const mobile = window.innerWidth <= 760;
  const shortLandscape = window.innerHeight <= 640 && window.innerWidth > window.innerHeight;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = mobile ? 38 : shortLandscape ? 35 : 34;
  camera.position.z = mobile ? 8.55 : shortLandscape ? 7.8 : 7.65;
  camera.updateProjectionMatrix();

  if (mobile) {
    organism.position.set(0.32, 0.48, 0);
    organism.scale.set(0.94, 1.03, 0.96);
  } else if (shortLandscape) {
    organism.position.set(1.18, 0.12, 0);
    organism.scale.set(0.94, 0.91, 0.94);
  } else {
    organism.position.set(1.32, 0.16, 0);
    organism.scale.set(1.03, 0.98, 1.0);
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
}

function init() {
  if (!webGLAvailable()) {
    statusText.textContent = "Still form";
    motionToggle.hidden = true;
    document.documentElement.classList.add("fallback-ready");
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.15);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  organism = createOrganism();
  scene.add(organism);
  container.appendChild(renderer.domElement);
  setResponsiveComposition();

  document.documentElement.classList.add("webgl-ready");
  statusText.textContent = isPaused ? "Resting" : "Alive";
  motionToggle.textContent = isPaused ? "Resume motion" : "Pause motion";
  motionToggle.setAttribute("aria-pressed", String(isPaused));

  bindEvents();
  animate();
}

function bindEvents() {
  window.addEventListener("resize", setResponsiveComposition, { passive: true });

  window.addEventListener("pointermove", (event) => {
    pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1)
    );
    rotationTarget.set(pointerTarget.y * 0.16, pointerTarget.x * 0.23);
  }, { passive: true });

  window.addEventListener("pointerdown", () => {
    pointerIsDown = true;
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    pointerIsDown = false;
  }, { passive: true });

  window.addEventListener("pointercancel", () => {
    pointerIsDown = false;
  }, { passive: true });

  window.addEventListener("blur", () => {
    pointerIsDown = false;
  });

  motionToggle.addEventListener("click", () => {
    isPaused = !isPaused;
    motionToggle.setAttribute("aria-pressed", String(isPaused));
    motionToggle.textContent = isPaused ? "Resume motion" : "Pause motion";
    statusText.textContent = isPaused ? "Resting" : "Alive";
    previousTime = performance.now();
  });

  reducedMotionQuery.addEventListener("change", (event) => {
    isPaused = event.matches;
    motionToggle.setAttribute("aria-pressed", String(isPaused));
    motionToggle.textContent = isPaused ? "Resume motion" : "Pause motion";
    statusText.textContent = isPaused ? "Resting" : "Alive";
  });

  document.addEventListener("visibilitychange", () => {
    previousTime = performance.now();
  });
}

function animate(now = performance.now()) {
  animationFrame = requestAnimationFrame(animate);

  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;
  if (!isPaused && !document.hidden) elapsed += delta;

  const pointerEase = 1 - Math.pow(0.001, delta);
  pointer.lerp(pointerTarget, pointerEase);

  const energyTarget = pointerIsDown ? 1.0 : 0.25 + pointerTarget.length() * 0.14;
  clockVelocity.energy += (energyTarget - clockVelocity.energy) * (1 - Math.pow(0.008, delta));
  uniforms.uEnergy.value = clockVelocity.energy;
  uniforms.uTime.value = elapsed;

  const idleYaw = isPaused ? 0 : Math.sin(elapsed * 0.17) * 0.12;
  const idlePitch = isPaused ? 0 : Math.cos(elapsed * 0.13) * 0.06;
  organism.rotation.y += (
    0.46 + rotationTarget.y + idleYaw - organism.rotation.y
  ) * (1 - Math.pow(0.015, delta));
  organism.rotation.x += (
    -0.18 + rotationTarget.x + idlePitch - organism.rotation.x
  ) * (1 - Math.pow(0.015, delta));
  organism.rotation.z = -0.12 + (isPaused ? 0 : Math.sin(elapsed * 0.11) * 0.08);

  renderer.render(scene, camera);
}

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
  renderer?.dispose();
});

init();
