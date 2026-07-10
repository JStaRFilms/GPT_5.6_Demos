"use client";

import { useMemo, useRef } from "react";
import { MarchingCube, MarchingCubes, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prismV2FragmentShader, prismV2VertexShader } from "@/shaders/prism-v2";

type VersionTwoProps = {
  paused: boolean;
  interacting: boolean;
};

type MetaballConfig = {
  base: [number, number, number];
  drift: [number, number, number];
  frequency: number;
  phase: number;
  scale: number;
  strength: number;
};

type LivingMetaballProps = MetaballConfig & {
  paused: boolean;
  time: React.MutableRefObject<number>;
  visualPosition: [number, number, number];
  visualScale: [number, number, number];
};

const metaballs: MetaballConfig[] = [
  { base: [0.00, 0.02, 0.00], drift: [0.06, 0.045, 0.035], frequency: 0.56, phase: 0.0, scale: 1.34, strength: 0.56 },
  { base: [0.34, 0.23, 0.01], drift: [0.055, 0.07, 0.035], frequency: 0.48, phase: 1.2, scale: 1.12, strength: 0.50 },
  { base: [-0.34, 0.20, 0.07], drift: [0.07, 0.05, 0.04], frequency: 0.44, phase: 2.35, scale: 1.13, strength: 0.50 },
  { base: [0.27, -0.31, -0.05], drift: [0.065, 0.055, 0.05], frequency: 0.53, phase: 3.0, scale: 1.18, strength: 0.52 },
  { base: [-0.30, -0.31, 0.02], drift: [0.05, 0.065, 0.04], frequency: 0.47, phase: 4.1, scale: 1.12, strength: 0.50 },
  { base: [0.02, 0.47, -0.08], drift: [0.08, 0.035, 0.045], frequency: 0.39, phase: 5.0, scale: 0.96, strength: 0.46 },
  { base: [0.48, -0.03, 0.05], drift: [0.035, 0.075, 0.035], frequency: 0.51, phase: 0.7, scale: 0.91, strength: 0.45 },
  { base: [-0.48, -0.04, -0.03], drift: [0.04, 0.06, 0.045], frequency: 0.43, phase: 2.0, scale: 0.92, strength: 0.45 },
  { base: [0.05, -0.51, 0.10], drift: [0.075, 0.035, 0.04], frequency: 0.37, phase: 3.65, scale: 0.86, strength: 0.43 },
  { base: [0.18, -0.16, 0.12], drift: [0.035, 0.045, 0.03], frequency: 0.46, phase: 4.75, scale: 1.06, strength: 0.50 },
];

function LivingMetaball({
  base,
  drift,
  frequency,
  phase,
  scale,
  strength,
  paused,
  time,
  visualPosition,
  visualScale,
}: LivingMetaballProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = time.current;
    const targetX = base[0] + (paused ? 0 : Math.sin(t * frequency + phase) * drift[0]);
    const targetY = base[1] + (paused ? 0 : Math.cos(t * frequency * 0.83 + phase) * drift[1]);
    const targetZ = base[2] + (paused ? 0 : Math.sin(t * frequency * 0.69 + phase * 1.7) * drift[2]);
    ref.current.position.set(
      (targetX - visualPosition[0]) / visualScale[0],
      (targetY - visualPosition[1]) / visualScale[1],
      (targetZ - visualPosition[2]) / visualScale[2],
    );
  });

  return <MarchingCube ref={ref} strength={strength * scale * 1.08} subtract={7.5} />;
}

export function VersionTwo({ paused, interacting }: VersionTwoProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const localTime = useRef(0);
  const energy = useRef(0.28);
  const smoothedPointer = useRef(new THREE.Vector2());
  const { size } = useThree();
  const compact = size.width <= 760;
  const visualPosition = useMemo<[number, number, number]>(
    () => (compact ? [0.15, 0.26, 0] : [0.52, 0.06, 0]),
    [compact],
  );
  const visualScale = useMemo<[number, number, number]>(
    () => (compact ? [4.12, 4.52, 3.9] : [4.25, 3.82, 3.95]),
    [compact],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0.28 },
      uPointer: { value: new THREE.Vector2() },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!paused) localTime.current += Math.min(delta, 0.05);
    smoothedPointer.current.lerp(state.pointer, 1 - Math.pow(0.001, delta));
    energy.current = THREE.MathUtils.damp(
      energy.current,
      interacting ? 1 : 0.28 + state.pointer.length() * 0.14,
      5.2,
      delta,
    );

    if (material.current) {
      material.current.uniforms.uTime.value = localTime.current;
      material.current.uniforms.uEnergy.value = energy.current;
      material.current.uniforms.uPointer.value.copy(smoothedPointer.current);
    }
  });

  return (
    <>
      <MarchingCubes
        resolution={compact ? 58 : 72}
        maxPolyCount={90000}
        enableUvs={false}
        enableColors={false}
        position={visualPosition}
        scale={visualScale}
      >
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={prismV2VertexShader}
          fragmentShader={prismV2FragmentShader}
          toneMapped
        />
        {metaballs.map((ball, index) => (
          <LivingMetaball
            key={index}
            {...ball}
            paused={paused}
            time={localTime}
            visualPosition={visualPosition}
            visualScale={visualScale}
          />
        ))}
      </MarchingCubes>
      <Sparkles
        count={compact ? 16 : 26}
        scale={compact ? [3.2, 5.2, 2.2] : [5.8, 4.2, 2.4]}
        position={compact ? [0.2, 0.3, -1] : [1.2, 0.1, -1]}
        size={0.42}
        speed={paused ? 0 : 0.08}
        opacity={0.15}
        color="#ff6bc6"
        noise={1.2}
      />
    </>
  );
}
