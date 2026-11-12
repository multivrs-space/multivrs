"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, MathUtils, type Shape } from "three";
import { countryHeight } from "@/features/dashboard/three/map/map-layout";

interface CountryMeshProps {
  shapes: Shape[];
  level: number;
  dark: boolean;
  primary: Color;
  hovered: boolean;
  /** 0 → 1 as the map rises on load. */
  rise: { current: number };
  onHover: (hovered: boolean) => void;
}

const LAND = { dark: new Color("#24242c"), light: new Color("#d9d9e1") };

/** One country: a slab raised and lit by its share of the traffic. */
export function CountryMesh({
  shapes,
  level,
  dark,
  primary,
  hovered,
  rise,
  onHover,
}: CountryMeshProps) {
  const group = useRef<Group>(null);
  const height = countryHeight(level);
  const color = useMemo(() => {
    const land = dark ? LAND.dark : LAND.light;
    return level > 0
      ? land.clone().lerp(primary, 0.18 + 0.82 * level)
      : land.clone();
  }, [dark, level, primary]);
  // Only countries with traffic glow; the rest stay graphite.
  const glow = useMemo(
    () =>
      dark && level > 0
        ? primary.clone().multiplyScalar(0.36 * level * level)
        : new Color(0, 0, 0),
    [dark, level, primary],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = Math.max(0.02, rise.current) * (hovered ? 1.08 : 1);
    group.current.scale.y = MathUtils.damp(
      group.current.scale.y,
      target,
      6,
      delta,
    );
  });

  return (
    <group ref={group} scale={[1, 0.02, 1]}>
      <mesh
        onPointerOut={() => onHover(false)}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(true);
        }}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry
          args={[
            shapes,
            { depth: height, bevelEnabled: false, curveSegments: 1 },
          ]}
        />
        <meshPhysicalMaterial
          clearcoat={dark ? 0.8 : 0.3}
          clearcoatRoughness={0.25}
          color={
            hovered ? color.clone().offsetHSL(0, 0, dark ? 0.08 : -0.06) : color
          }
          emissive={glow}
          metalness={dark ? 0.1 : 0.02}
          roughness={dark ? 0.45 : 0.6}
        />
      </mesh>
    </group>
  );
}
