"use client";

import type { FrameworkId } from "@multivrs/config";
import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveRocket } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { BuildLogViewer } from "@/features/dashboard/components/deployments/BuildLogViewer";
import { BuildPhases } from "@/features/dashboard/components/deployments/BuildPhases";
import { LiveElapsed } from "@/features/dashboard/components/deployments/LiveElapsed";
import { DeploymentFactsCard } from "@/features/dashboard/components/new-project/DeploymentFactsCard";
import { DeploySuccess } from "@/features/dashboard/components/new-project/DeploySuccess";
import { DeployViewActions } from "@/features/dashboard/components/new-project/DeployViewActions";
import type { StartedDeployment } from "@/features/dashboard/hooks/useDeploymentImport";
import { useLiveBuild } from "@/features/dashboard/hooks/useLiveBuild";
import {
  buildPhases,
  currentPhase,
} from "@/features/dashboard/lib/build-phases";
import { formatElapsed } from "@/features/dashboard/lib/format-elapsed";
import type { RepositorySource } from "@/features/dashboard/types/deployment-import.types";

interface ImportDeployViewProps {
  address: string;
  framework: FrameworkId;
  onEdit: () => void;
  onRetry: () => void;
  retrying: boolean;
  rootDirectory: string;
  source: RepositorySource;
  started: StartedDeployment;
  username: string;
}

/** The first build, followed line by line until it is live or stops. */
export function ImportDeployView(props: ImportDeployViewProps) {
  const { started, source } = props;
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const build = useLiveBuild({
    projectId: started.project.id,
    deploymentId: started.deploymentId,
    initialStatus: "queued",
    initialLogs: [],
    onSettled: () => setFinishedAt(Date.now()),
  });
  const phases = buildPhases(build.logs, build.status);
  const total = finishedAt
    ? formatElapsed(
        Math.round((finishedAt - Date.parse(started.startedAt)) / 1_000),
      )
    : null;
  const detailsHref = `/${props.username}/${started.project.slug}/deployments/${started.deploymentId}`;

  if (build.status === "ready")
    return (
      <DeploySuccess
        address={props.address}
        detailsHref={detailsHref}
        phases={phases}
        project={started.project}
        total={total}
        username={props.username}
      />
    );

  const stopped = !build.running;
  const canceled = build.status === "canceled";
  const step = currentPhase(phases);
  return (
    <>
      <DashboardPageHeader
        description={
          stopped
            ? `Nothing went live. Fix the cause, then try again${total ? ` · stopped after ${total}` : ""}.`
            : "Stay here to watch it, or leave: the build carries on without you."
        }
        eyebrow={`${source.owner}/${source.name} · ${source.branch}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {stopped
              ? "The build stopped"
              : `Deploying ${started.project.name}`}
            <StatusOrb
              label={stopped ? (canceled ? "Canceled" : "Failed") : "Building"}
              pill
              tone={stopped ? "error" : "building"}
            />
          </span>
        }
      />
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <div className="grid min-w-0 gap-3 lg:col-span-8">
          <DashCard aria-label="Build progress">
            <DashCardHeader
              action={
                <DeployViewActions
                  deploymentId={started.deploymentId}
                  onEdit={props.onEdit}
                  onRetry={props.onRetry}
                  projectId={started.project.id}
                  retrying={props.retrying}
                  running={build.running}
                />
              }
              description={
                stopped ? (
                  `${step?.label ?? "Build"} didn't finish`
                ) : (
                  <>
                    {step ? `${step.label} · ` : ""}
                    <LiveElapsed since={started.startedAt} />
                  </>
                )
              }
              icon={LiveRocket}
              title="Progress"
            />
            <div className="space-y-3 p-5 pt-4">
              <BuildPhases phases={phases} since={started.startedAt} />
              {build.status === "error" ? (
                <p className="rounded-tile border border-rose-500/25 bg-rose-500/[0.06] px-3.5 py-3 font-geist-mono text-[12px] leading-relaxed break-words text-rose-700 dark:text-rose-200">
                  {build.deployment?.errorMessage ??
                    "The build failed. The log below shows where."}
                </p>
              ) : null}
            </div>
          </DashCard>
          <BuildLogViewer live={build.running} logs={build.logs} />
        </div>
        <aside className="lg:sticky lg:top-[calc(var(--topbar-h)+1.25rem)] lg:col-span-4">
          <DeploymentFactsCard
            address={props.address}
            detailsHref={detailsHref}
            framework={props.framework}
            rootDirectory={props.rootDirectory}
            source={source}
          />
        </aside>
      </div>
    </>
  );
}
