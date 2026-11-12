"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { ChoroplethMap } from "@/components/dashboard/charts/ChoroplethMap";
import type { CountryValue } from "@/features/dashboard/lib/world-map";
import { SceneErrorBoundary } from "@/features/dashboard/three/SceneErrorBoundary";
import { useSceneEnvironment } from "@/features/dashboard/three/useSceneEnvironment";
import { cn } from "@/lib/utils";

// three, R3F and drei load only when the stage comes near the viewport.
const WorldMapCanvas = dynamic(
  () => import("@/features/dashboard/three/map/WorldMapCanvas"),
  { ssr: false },
);

/** Fades the map into the page on every side, so it reads as the ground. */
const BLEED =
  "[mask-image:radial-gradient(ellipse_75%_80%_at_55%_45%,black_45%,transparent_100%)]";

/**
 * The analytics hero: a live 3D world under the page's first cards. Until
 * WebGL is ready (or where there's none) the flat map stands in; on phones
 * the map sits above the cards instead of behind them.
 */
export function AnalyticsStage({
  items,
  unit,
  pins = 3,
  children,
  className,
}: {
  items: readonly CountryValue[];
  /** What a country's value counts, e.g. "visitors". */
  unit: string;
  pins?: number;
  children: ReactNode;
  className?: string;
}) {
  const slot = useRef<HTMLElement>(null);
  const { near, scene } = useSceneEnvironment(slot);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section
      aria-label={`${unit} by country`}
      className={cn("relative", className)}
      ref={slot}
    >
      <div
        aria-hidden="true"
        className={cn(
          "relative h-[320px] lg:absolute lg:inset-0 lg:h-auto",
          BLEED,
        )}
      >
        <ChoroplethMap
          callouts={0}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-0" : "opacity-100",
          )}
          items={items}
          unit={unit}
        />
        {near && scene?.webgl ? (
          <SceneErrorBoundary>
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                ready ? "opacity-100" : "opacity-0",
              )}
            >
              <WorldMapCanvas
                animate={!scene.reduced}
                dark={scene.dark}
                items={items}
                onReady={onReady}
                pins={pins}
                primary={scene.primary}
                unit={unit}
              />
            </div>
          </SceneErrorBoundary>
        ) : null}
      </div>
      <div className="relative z-10 lg:pointer-events-none lg:min-h-[620px] lg:p-4 [&>*]:lg:pointer-events-auto">
        {children}
      </div>
    </section>
  );
}
