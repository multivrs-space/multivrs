"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, MathUtils } from "three";
import type { IconPart } from "@/components/icons/animated";
import { buildGlyphGeometry } from "@/features/dashboard/three/glyph-geometry";

interface GlyphTileProps {
  parts: readonly IconPart[];
  dark: boolean;
  /** The theme's --primary, read from CSS so the palette stays in one place. */
  primary: string;
  animate: boolean;
}

const TILE = 2;
const DEPTH = 0.5;
const GLYPH_EXTENT = 0.6;
const TUBE_RADIUS = 0.055;

/**
 * A rounded glass-and-metal tile with the icon's strokes standing proud of
 * its face. Obsidian with chrome in dark mode, frosted ceramic with tinted
 * metal in light mode. It sways slowly and leans toward the pointer.
 */
export function GlyphTile({ parts, dark, primary, animate }: GlyphTileProps) {
  const group = useRef<Group>(null);
  const glyph = useRef<Group>(null);
  const geometry = useMemo(
    () => buildGlyphGeometry(parts, GLYPH_EXTENT, DEPTH / 2 + TUBE_RADIUS),
    [parts],
  );
  const accent = useMemo(() => new Color(primary), [primary]);

  useFrame((state, delta) => {
    if (!group.current || !glyph.current) return;
    const t = state.clock.elapsedTime;
    const sway = animate ? Math.sin(t * 0.55) * 0.28 : 0;
    const pointerX = MathUtils.clamp(state.pointer.x, -1, 1);
    const pointerY = MathUtils.clamp(state.pointer.y, -1, 1);
    const targetY = -0.38 + sway + pointerX * 0.25;
    const targetX =
      0.18 + (animate ? Math.sin(t * 0.4) * 0.05 : 0) - pointerY * 0.18;
    const ease = 1 - Math.exp(-delta * 3);
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      targetY,
      ease,
    );
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      ease,
    );
    glyph.current.position.z = animate ? 0.03 + Math.sin(t * 1.4) * 0.03 : 0.03;
  });

  return (
    <group ref={group} rotation={[0.18, -0.38, 0]}>
      <RoundedBox args={[TILE, TILE, DEPTH]} radius={0.42} smoothness={8}>
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={dark ? 0.06 : 0.18}
          color={dark ? "#060608" : "#f4f4f7"}
          metalness={dark ? 0.55 : 0.04}
          roughness={dark ? 0.24 : 0.42}
        />
      </RoundedBox>
      <group ref={glyph}>
        {geometry.strokes.map((stroke) => (
          <group key={stroke.id}>
            <mesh>
              <tubeGeometry
                args={[
                  stroke.curve,
                  Math.max(24, stroke.curve.points.length * 6),
                  TUBE_RADIUS,
                  14,
                  stroke.closed,
                ]}
              />
              <GlyphMaterial accent={accent} dark={dark} />
            </mesh>
            {stroke.closed
              ? null
              : (
                  [
                    ["start", stroke.start],
                    ["end", stroke.end],
                  ] as const
                ).map(([end, cap]) => (
                  <mesh key={end} position={cap}>
                    <sphereGeometry args={[TUBE_RADIUS, 14, 14]} />
                    <GlyphMaterial accent={accent} dark={dark} />
                  </mesh>
                ))}
          </group>
        ))}
        {geometry.dots.map((dot) => (
          <mesh key={dot.id} position={dot.at}>
            <sphereGeometry args={[TUBE_RADIUS * 1.15, 14, 14]} />
            <GlyphMaterial accent={accent} dark={dark} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlyphMaterial({ dark, accent }: { dark: boolean; accent: Color }) {
  return dark ? (
    <meshPhysicalMaterial
      clearcoat={1}
      color="#f2f2f7"
      metalness={1}
      roughness={0.16}
    />
  ) : (
    <meshPhysicalMaterial
      clearcoat={1}
      color={accent}
      metalness={0.85}
      roughness={0.24}
    />
  );
}
