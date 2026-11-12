"use client";

import { useSyncExternalStore } from "react";
import { formatElapsed } from "@/features/dashboard/lib/format-elapsed";

function subscribe(tick: () => void) {
  const id = setInterval(tick, 1_000);
  return () => clearInterval(id);
}

const nowInSeconds = () => Math.floor(Date.now() / 1_000);

/**
 * Time since a build started, ticking each second. Renders nothing on the
 * server, so the first paint never disagrees with the browser's clock.
 */
export function LiveElapsed({ since }: { since: string }) {
  const now = useSyncExternalStore(subscribe, nowInSeconds, () => 0);
  if (!now) return null;
  const seconds = Math.max(0, now - Math.floor(Date.parse(since) / 1_000));
  return <span className="figure">{formatElapsed(seconds)}</span>;
}
