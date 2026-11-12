"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type LogoState = "loading" | "ready" | "failed";

/**
 * A project's logo from its live site, over the Multivrs mark until it has
 * actually loaded. A plain eager <img>: lazy loading and missed load events
 * (when the image settles before hydration) left logos blank until hover.
 */
export function ProjectFavicon({
  className,
  name,
  url,
}: {
  className?: string;
  name: string;
  url: string | null;
}) {
  const [state, setState] = useState<LogoState>(url ? "loading" : "failed");
  // Catch images that finished before React attached its handlers.
  const settled = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) setState(image.naturalWidth > 0 ? "ready" : "failed");
  }, []);

  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[10px]",
        className,
      )}
    >
      {state === "ready" ? null : (
        // biome-ignore lint/performance/noImgElement: a tiny local mark; next/image adds nothing here
        <img
          alt=""
          aria-hidden="true"
          className="size-full object-contain"
          height={40}
          src="/logo.png"
          width={40}
        />
      )}
      {url && state !== "failed" ? (
        // biome-ignore lint/performance/noImgElement: remote favicons of any size; next/image would proxy or lazy-load them
        <img
          alt={`${name} logo`}
          className={cn(
            "absolute inset-0 size-full object-contain transition-opacity duration-300",
            state === "ready" ? "opacity-100" : "opacity-0",
          )}
          decoding="async"
          height={40}
          loading="eager"
          onError={() => setState("failed")}
          onLoad={() => setState("ready")}
          ref={settled}
          src={url}
          width={40}
        />
      ) : null}
    </span>
  );
}
