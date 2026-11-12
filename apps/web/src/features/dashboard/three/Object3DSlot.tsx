"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { IconPart } from "@/components/icons/animated";
import { SceneErrorBoundary } from "@/features/dashboard/three/SceneErrorBoundary";
import { cn } from "@/lib/utils";

// three, R3F and drei load only when a slot comes near the viewport.
const GlyphCanvas = dynamic(
  () => import("@/features/dashboard/three/GlyphCanvas"),
  {
    ssr: false,
  },
);

interface SceneEnvironment {
  dark: boolean;
  webgl: boolean;
  reduced: boolean;
  primary: string;
}

interface Object3DSlotProps {
  /** The icon geometry (`Icon.parts`) whose strokes become the 3D glyph. */
  parts: readonly IconPart[];
  /** Accessible description of the object. */
  label: string;
  className?: string;
  /** The flat icon shown on the placeholder tile, rendered by the caller. */
  children: ReactNode;
}

/**
 * A live 3D object for empty, locked and celebratory states. Until the scene
 * is ready (or if WebGL is unavailable) it shows the flat icon on a plain
 * tile; it never pretends to be 3D with CSS.
 */
export function Object3DSlot({
  parts,
  label,
  className,
  children,
}: Object3DSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [scene, setScene] = useState<SceneEnvironment | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Re-read when the theme flips: --primary differs between themes.
    setScene({
      dark: resolvedTheme === "dark",
      webgl: "WebGLRenderingContext" in window,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      primary:
        getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim() || "#a855f7",
    });
  }, [resolvedTheme]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setNear(visible);
        if (!visible) setReady(false);
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-label={label}
      className={cn("relative", className)}
      ref={ref}
      role="img"
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 grid place-items-center transition-opacity duration-500",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <span className="surface-raised grid size-[56%] place-items-center rounded-[28%] text-muted-foreground">
          {children}
        </span>
      </div>
      {near && scene?.webgl ? (
        <SceneErrorBoundary>
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <GlyphCanvas
              animate={!scene.reduced}
              dark={scene.dark}
              onReady={() => setReady(true)}
              parts={parts}
              primary={scene.primary}
            />
          </div>
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
}
