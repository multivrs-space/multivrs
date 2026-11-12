"use client";

import { BuildLogViewer } from "@/features/dashboard/components/deployments/BuildLogViewer";
import { useLiveBuild } from "@/features/dashboard/hooks/useLiveBuild";
import { buildPhases } from "@/features/dashboard/lib/build-phases";
import type { DashboardDeploymentLog } from "@/lib/services/deployment-detail.types";

/** The build's steps and log, following a running build without reloads. */
export function LiveBuildLog(props: {
  projectId: string;
  deploymentId: string;
  initialStatus: string;
  initialLogs: DashboardDeploymentLog[];
  /** When the deployment was created, the clock before its first line. */
  createdAt: string;
}) {
  const { logs, running, status } = useLiveBuild(props);
  const steps = buildPhases(logs, status);
  return (
    <BuildLogViewer
      live={running}
      logs={logs}
      steps={steps}
      stepsSince={props.createdAt}
    />
  );
}
