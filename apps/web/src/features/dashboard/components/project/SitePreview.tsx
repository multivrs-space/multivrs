"use client";

import { useCallback, useState } from "react";
import { LiveArrowUpRight } from "@/components/icons/animated";
import { SiteIdentity } from "@/features/dashboard/components/project/SiteIdentity";
import { cn } from "@/lib/utils";

/**
 * The screenshot taken when this deployment went live, over the site's
 * icon tile. Until the image loads, or if no capture exists yet, the tile
 * is what shows.
 */
export function SitePreview({
  address,
  faviconUrl,
  name,
  previewUrl,
}: {
  address: string;
  faviconUrl: string | null;
  name: string;
  previewUrl: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  // A cached image can finish before React attaches onLoad; read it directly.
  const settled = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) setState(image.naturalWidth > 0 ? "ready" : "failed");
  }, []);
  const host = address.replace(/^https?:\/\//, "");
  return (
    <div className="relative">
      <SiteIdentity address={address} faviconUrl={faviconUrl} name={name} />
      {state === "failed" ? null : (
        <a
          aria-label={`Open ${host}`}
          className={cn(
            "surface-inset group absolute inset-0 overflow-hidden rounded-tile transition-opacity duration-500",
            state === "ready" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          data-icon-trigger
          href={address}
          inert={state !== "ready"}
          rel="noreferrer"
          target="_blank"
        >
          {/* biome-ignore lint/performance/noImgElement: a private, already-sized screenshot from our own API */}
          <img
            alt={`${host} when this deployment went live`}
            className="size-full object-cover object-top"
            onError={() => setState("failed")}
            onLoad={() => setState("ready")}
            ref={settled}
            src={previewUrl}
          />
          <span className="surface-raised absolute right-3 bottom-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Visit <LiveArrowUpRight className="size-3" strokeWidth={2.25} />
          </span>
        </a>
      )}
    </div>
  );
}
