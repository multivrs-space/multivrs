"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { CountryValue } from "@/features/dashboard/lib/world-map";
import { WorldMapScene } from "@/features/dashboard/three/map/WorldMapScene";

interface WorldMapCanvasProps {
  items: readonly CountryValue[];
  unit: string;
  dark: boolean;
  primary: string;
  animate: boolean;
  pins: number;
  onReady: () => void;
}

/**
 * The live 3D map behind the analytics stage. Lighting is procedural, so
 * nothing is fetched beyond the map outline the flat map already uses.
 */
export default function WorldMapCanvas({
  onReady,
  dark,
  primary,
  ...scene
}: WorldMapCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 30, near: 1, far: 6000, position: [0, 600, 600] }}
      dpr={[1, 1.75]}
      frameloop={scene.animate ? "always" : "demand"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
      <hemisphereLight
        color={dark ? "#ffffff" : "#ffffff"}
        groundColor={dark ? "#0b0b10" : "#c9c9d4"}
        intensity={dark ? 0.35 : 0.9}
      />
      <directionalLight
        intensity={dark ? 1.4 : 1.8}
        position={[-200, 500, 300]}
      />
      <pointLight
        color={primary}
        decay={0}
        intensity={dark ? 0.6 : 0.25}
        position={[200, 120, 200]}
      />
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={dark ? 1.6 : 2.4}
          position={[0, 5, 2]}
          rotation-x={Math.PI / 2}
          scale={[10, 4, 1]}
        />
        <Lightformer
          color={primary}
          form="ring"
          intensity={dark ? 0.25 : 0.3}
          position={[4, 1, 3]}
          scale={2}
        />
      </Environment>
      <Suspense fallback={null}>
        <WorldMapScene
          dark={dark}
          onReady={onReady}
          primary={primary}
          {...scene}
        />
      </Suspense>
    </Canvas>
  );
}
