"use client";

import { deploymentSchema } from "@multivrs/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface WatchedBuild {
  projectId: string;
  deploymentId: string;
  /** The raw status the page was rendered with: "queued" or "building". */
  status: string;
}

async function currentStatus(build: WatchedBuild): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/projects/${build.projectId}/deployments/${build.deploymentId}`,
    );
    if (!response.ok) return null;
    return deploymentSchema.parse(await response.json()).status;
  } catch {
    return null;
  }
}

/**
 * Checks the builds on screen every second and re-renders the page the moment
 * one moves on (queued → building → ready or failed). Only the running ones
 * are asked about, so a page of finished deployments costs nothing.
 */
export function BuildWatcher({ builds }: { builds: readonly WatchedBuild[] }) {
  const router = useRouter();
  useEffect(() => {
    if (!builds.length) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      if (document.visibilityState === "visible") {
        const statuses = await Promise.all(builds.map(currentStatus));
        if (stopped) return;
        if (
          statuses.some((status, i) => status && status !== builds[i]?.status)
        ) {
          // The refreshed page brings new builds, which restarts this watch;
          // if it hasn't landed in 3s, ask again.
          router.refresh();
          timer = setTimeout(tick, 3_000);
          return;
        }
      }
      if (!stopped) timer = setTimeout(tick, 1_000);
    };
    timer = setTimeout(tick, 1_000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [builds, router]);
  return null;
}
