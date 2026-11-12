"use client";

import { useTheme } from "next-themes";
import { type RefObject, useEffect, useState } from "react";

export interface SceneEnvironment {
  dark: boolean;
  webgl: boolean;
  reduced: boolean;
  primary: string;
}

/**
 * What a live 3D scene needs from the page: the theme and its --primary,
 * whether WebGL exists, whether motion is welcome, and whether the slot is
 * near the viewport (scenes only load and run when they are).
 */
export function useSceneEnvironment(slot: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
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
    const node = slot.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry?.isIntersecting ?? false),
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [slot]);

  return { near, scene };
}
