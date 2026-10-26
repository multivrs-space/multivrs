"use client";

import { GitBranch, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeploymentProgress } from "@/features/dashboard/components/DeploymentProgress";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import type { useDeploymentImport } from "@/features/dashboard/hooks/useDeploymentImport";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

type DeploymentState = ReturnType<typeof useDeploymentImport>;

export function DeployPanel({
  config,
  deployment,
  disabled,
  onDeploy,
  source,
}: {
  config: DeploymentImportConfig;
  deployment: DeploymentState;
  disabled: boolean;
  onDeploy: () => void;
  source: RepositorySource;
}) {
  const rows = [
    {
      label: "Repository",
      value: (
        <span className="flex items-center gap-1.5 truncate">
          <GitHubMark className="size-3.5 shrink-0" />
          {source.owner}/{source.name}
        </span>
      ),
    },
    {
      label: "Branch",
      value: (
        <span className="flex items-center gap-1.5 font-mono">
          <GitBranch className="size-3.5 shrink-0" />
          {source.branch}
        </span>
      ),
    },
    { label: "Framework", value: FRAMEWORK_LABELS[config.framework] },
    {
      label: "Root",
      value: <span className="font-mono">{config.rootDirectory}</span>,
    },
  ];

  return (
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised) p-4">
      <h2 className="text-sm font-semibold">
        {deployment.status === "idle" ? "Ready to deploy" : "Deployment"}
      </h2>
      {deployment.status === "idle" ? (
        <>
          <dl className="mt-3 divide-y divide-(--hairline) text-xs">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="min-w-0 truncate text-right text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <Button
            type="button"
            className="mt-4 w-full"
            disabled={disabled}
            onClick={onDeploy}
          >
            <Rocket className="size-4" /> Deploy
          </Button>
        </>
      ) : (
        <div className="mt-3">
          <DeploymentProgress
            cancel={deployment.cancel}
            deploying={deployment.deploying}
            detailsUrl={deployment.detailsUrl}
            logs={deployment.logs}
            seconds={deployment.seconds}
            status={deployment.status}
          />
        </div>
      )}
    </section>
  );
}
