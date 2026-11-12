"use client";

import type { Deployment } from "@multivrs/client";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { getImportProgress } from "@/features/dashboard/lib/deployment-import.client";
import type { DashboardDeploymentLog } from "@/lib/services/deployment-detail.types";

const POLL_MS = 1_000;
const settled = (status: string) =>
  status !== "queued" && status !== "building";

/**
 * A deployment's status and log, polled from the API while it builds. Each
 * poll waits for the last to finish, so slow responses never pile up. When
 * the build settles, `onSettled` runs once; by default the page re-renders
 * so its header and summary catch up.
 */
export function useLiveBuild(options: {
  projectId: string;
  deploymentId: string;
  initialStatus: string;
  initialLogs: DashboardDeploymentLog[];
  onSettled?: (deployment: Deployment) => void;
}) {
  const { projectId, deploymentId } = options;
  const router = useRouter();
  const [status, setStatus] = useState(options.initialStatus);
  const [logs, setLogs] = useState(options.initialLogs);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const settle = useEffectEvent((latest: Deployment) => {
    if (options.onSettled) options.onSettled(latest);
    else router.refresh();
  });
  const running = !settled(status);

  useEffect(() => {
    if (!running) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const progress = await getImportProgress(projectId, deploymentId);
        if (stopped) return;
        setLogs(
          progress.logs.map((log) => ({
            id: log.id,
            level: log.level,
            message: log.message,
            createdAt: log.createdAt,
          })),
        );
        setDeployment(progress.deployment);
        setStatus(progress.deployment.status);
        if (settled(progress.deployment.status)) {
          settle(progress.deployment);
          return;
        }
      } catch {
        // A missed poll is fine; the next one catches up.
      }
      if (!stopped) timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [running, projectId, deploymentId]);

  return { status, logs, running, deployment };
}
