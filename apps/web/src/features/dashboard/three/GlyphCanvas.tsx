"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { IconPart } from "@/components/icons/animated";
import { GlyphTile } from "@/features/dashboard/three/GlyphTile";

interface GlyphCanvasProps {
  parts: readonly IconPart[];
  dark: boolean;
  primary: string;
  animate: boolean;
  onReady: () => void;
}

/**
 * The live 3D scene for one GlyphTile. Lighting is procedural (studio
 * lightformers baked into an environment map) so nothing is fetched.
 */
export default function GlyphCanvas({
  parts,
  dark,
  primary,
  animate,
  onReady,
}: GlyphCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.1], fov: 30 }}
      className="pointer-events-none"
      dpr={[1, 1.75]}
      eventPrefix="client"
      // Track the pointer across the page so the tile leans toward it.
      eventSource={document.body}
      frameloop={animate ? "always" : "demand"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={onReady}
    >
      <ambientLight intensity={dark ? 0.15 : 0.6} />
      <directionalLight intensity={dark ? 1.2 : 1.6} position={[3, 4, 5]} />
      <pointLight
        color={primary}
        decay={0}
        intensity={dark ? 0.9 : 0.5}
        position={[-2.6, -1.4, 1.4]}
      />
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={dark ? 2.2 : 3}
          position={[0, 3, 2]}
          rotation-x={Math.PI / 2}
          scale={[6, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={dark ? 1.4 : 1.8}
          position={[-4, 0, 1]}
          rotation-y={Math.PI / 2}
          scale={[4, 1, 1]}
        />
        <Lightformer
          color={primary}
          form="ring"
          intensity={dark ? 0.8 : 0.5}
          position={[3, -1, 2]}
          scale={1.6}
        />
      </Environment>
      <GlyphTile
        animate={animate}
        dark={dark}
        parts={parts}
        primary={primary}
      />
    </Canvas>
  );
}
