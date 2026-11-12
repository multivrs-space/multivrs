"use client";

import { Grid, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Color, MathUtils, Vector3 } from "three";
import { formatCompact } from "@/components/dashboard/lib/format";
import {
  type CountryValue,
  countryName,
  drawableCountries,
} from "@/features/dashboard/lib/world-map";
import { CountryMesh } from "@/features/dashboard/three/map/CountryMesh";
import { MapPin } from "@/features/dashboard/three/map/MapPin";
import {
  cameraFraming,
  countryHeight,
  countryLevels,
  scenePoint,
} from "@/features/dashboard/three/map/map-layout";
import { loadCountryShapes } from "@/features/dashboard/three/map/map-shapes";

interface WorldMapSceneProps {
  items: readonly CountryValue[];
  unit: string;
  dark: boolean;
  primary: string;
  animate: boolean;
  pins: number;
  /** Called once the outlines are in, so the flat map can step aside. */
  onReady: () => void;
}

/**
 * The world as a tilted relief: every country a slab, raised and lit by its
 * share of visitors, pins on the leaders, the camera drifting slowly over
 * the busiest region and leaning toward the pointer.
 */
export function WorldMapScene({
  items,
  unit,
  dark,
  primary,
  animate,
  pins,
  onReady,
}: WorldMapSceneProps) {
  const countries = use(loadCountryShapes());
  const { camera, size } = useThree();
  const levels = useMemo(() => countryLevels(items), [items]);
  const accent = useMemo(() => new Color(primary), [primary]);
  const leaders = useMemo(
    () => drawableCountries(items).slice(0, pins),
    [items, pins],
  );
  const values = useMemo(
    () => new Map(items.map((item) => [item.code, item.value])),
    [items],
  );
  const frame = useMemo(
    () => cameraFraming(items, size.width / Math.max(size.height, 1)),
    [items, size.width, size.height],
  );
  const target = useMemo(() => new Vector3(...frame.target), [frame]);
  const rise = useRef(animate ? 0 : 1);
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => onReady(), [onReady]);

  useFrame((state, delta) => {
    rise.current = Math.min(1, rise.current + delta * (animate ? 0.9 : 10));
    const t = animate ? state.clock.elapsedTime : 0;
    const drift = Math.sin(t * 0.12) * frame.span * 0.03;
    const lean = MathUtils.clamp(state.pointer.x, -1, 1) * frame.span * 0.02;
    const [x, y, z] = frame.position;
    camera.position.x = MathUtils.damp(
      camera.position.x,
      x + drift + lean,
      2,
      delta,
    );
    camera.position.y = MathUtils.damp(camera.position.y, y, 2, delta);
    camera.position.z = MathUtils.damp(camera.position.z, z, 2, delta);
    camera.lookAt(target);
  });

  const hoveredPoint = hovered ? scenePoint(hovered) : null;
  return (
    <>
      <Grid
        cellColor={dark ? "#1d1d24" : "#d4d4dc"}
        cellSize={12}
        fadeDistance={frame.span * 2.4}
        fadeStrength={1.6}
        infiniteGrid
        position={[0, -0.05, 0]}
        sectionColor={dark ? "#2a2633" : "#c7c3d4"}
        sectionSize={60}
      />
      {countries.map((country) => (
        <CountryMesh
          dark={dark}
          hovered={hovered === country.code}
          key={country.code}
          level={levels.get(country.code) ?? 0}
          onHover={(on) =>
            setHovered((current) =>
              on ? country.code : current === country.code ? null : current,
            )
          }
          primary={accent}
          rise={rise}
          shapes={country.shapes}
        />
      ))}
      {leaders.map((item, index) => {
        const at = scenePoint(item.code);
        return at ? (
          <MapPin
            at={at}
            code={item.code}
            key={item.code}
            primary={primary}
            rank={index + 1}
            top={countryHeight(levels.get(item.code) ?? 0)}
            unit={unit}
            value={item.value}
          />
        ) : null;
      })}
      {hovered &&
      hoveredPoint &&
      !leaders.some((item) => item.code === hovered) ? (
        <Html
          center
          position={[
            hoveredPoint[0],
            countryHeight(levels.get(hovered) ?? 0) + 6,
            hoveredPoint[1],
          ]}
        >
          <div className="surface-glass pointer-events-none whitespace-nowrap rounded-[10px] px-2 py-1 font-hanken text-[11.5px]">
            <span className="font-medium text-foreground">
              {countryName(hovered)}
            </span>{" "}
            <span className="text-muted-foreground">
              {values.get(hovered)
                ? `${formatCompact(values.get(hovered) ?? 0)} ${unit}`
                : `no ${unit}`}
            </span>
          </div>
        </Html>
      ) : null}
    </>
  );
}
