"use client";

import { Suspense, useMemo } from "react";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { VersionOne } from "@/components/organisms/version-one";
import { VersionTwo } from "@/components/organisms/version-two";

export type PrismVersion = 1 | 2;

type PrismCanvasProps = {
  version: PrismVersion;
  paused: boolean;
  interacting: boolean;
  onInteractionChange: (active: boolean) => void;
};

export default function PrismCanvas({
  version,
  paused,
  interacting,
  onInteractionChange,
}: PrismCanvasProps) {
  const gl = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance" as const,
      stencil: false,
    }),
    [],
  );

  return (
    <div
      className="absolute inset-0 -z-10 touch-none"
      onPointerDown={() => onInteractionChange(true)}
      onPointerUp={() => onInteractionChange(false)}
      onPointerCancel={() => onInteractionChange(false)}
      onPointerLeave={() => onInteractionChange(false)}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.65], fov: 34, near: 0.1, far: 100 }}
        gl={gl}
        onCreated={({ gl: renderer }) => {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = version === 2 ? 1.12 : 1.06;
          renderer.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          {version === 1 ? (
            <VersionOne paused={paused} interacting={interacting} />
          ) : (
            <VersionTwo paused={paused} interacting={interacting} />
          )}
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              mipmapBlur
              intensity={version === 2 ? 0.42 : 0.24}
              luminanceThreshold={0.48}
              luminanceSmoothing={0.32}
            />
            <Noise opacity={0.018} blendFunction={BlendFunction.SOFT_LIGHT} />
            <Vignette eskil={false} offset={0.18} darkness={0.74} />
          </EffectComposer>
          <AdaptiveDpr pixelated={false} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
