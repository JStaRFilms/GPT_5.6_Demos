"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prismV1FragmentShader, prismV1VertexShader } from "@/shaders/prism-v1";

type VersionOneProps = {
  paused: boolean;
  interacting: boolean;
};

export function VersionOne({ paused, interacting }: VersionOneProps) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const localTime = useRef(0);
  const energy = useRef(0.24);
  const pointer = useRef(new THREE.Vector2());
  const { size } = useThree();
  const compact = size.width <= 760;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0.24 },
      uPointer: { value: new THREE.Vector2() },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!paused) localTime.current += Math.min(delta, 0.05);
    pointer.current.lerp(state.pointer, 1 - Math.pow(0.001, delta));
    energy.current = THREE.MathUtils.damp(
      energy.current,
      interacting ? 1 : 0.24 + state.pointer.length() * 0.12,
      5,
      delta,
    );

    if (material.current) {
      material.current.uniforms.uTime.value = localTime.current;
      material.current.uniforms.uEnergy.value = energy.current;
      material.current.uniforms.uPointer.value.copy(pointer.current);
    }

    if (group.current) {
      const idleYaw = paused ? 0 : Math.sin(localTime.current * 0.17) * 0.11;
      const idlePitch = paused ? 0 : Math.cos(localTime.current * 0.13) * 0.055;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        0.45 + pointer.current.x * 0.2 + idleYaw,
        3.5,
        delta,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -0.16 + pointer.current.y * 0.14 + idlePitch,
        3.5,
        delta,
      );
    }
  });

  return (
    <group
      ref={group}
      position={compact ? [0.32, 0.48, 0] : [1.28, 0.14, 0]}
      scale={compact ? [0.94, 1.03, 0.96] : [1.03, 0.98, 1]}
      rotation={[-0.16, 0.45, -0.11]}
    >
      <mesh>
        <sphereGeometry args={[2.12, 192, 128]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={prismV1VertexShader}
          fragmentShader={prismV1FragmentShader}
          toneMapped
        />
      </mesh>
    </group>
  );
}
