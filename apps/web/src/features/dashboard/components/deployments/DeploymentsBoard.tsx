"use client";

import { use, useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveRocket } from "@/components/icons/animated";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { DeploymentRow } from "@/features/dashboard/components/DeploymentRow";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { BuildWatcher } from "@/features/dashboard/components/deployments/BuildWatcher";
import { groupByDay } from "@/features/dashboard/lib/deployment-groups";
import { watchedBuilds } from "@/features/dashboard/lib/watched-builds";

type StatusFilter = "all" | "Ready" | "Building" | "Failed";
type EnvironmentFilter = "all" | "Production" | "Preview";

/**
 * Every deployment in scope with live status counts as filters, grouped by
 * day. Builds in progress are pinned above the history.
 */
export function DeploymentsBoard({
  deployments: deploymentsPromise,
  workspace,
}: {
  deployments: Promise<DashboardDeployment[] | null>;
  /** All projects at once, so rows name their project. */
  workspace: boolean;
}) {
  const deployments = use(deploymentsPromise) ?? [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [environment, setEnvironment] = useState<EnvironmentFilter>("all");
  const needle = query.trim().toLowerCase();
  const matches = (deployment: DashboardDeployment, value: StatusFilter) =>
    value === "all" ||
    deployment.status === value ||
    (value === "Building" && deployment.status === "Queued");
  const count = (value: StatusFilter) =>
    deployments.filter((deployment) => matches(deployment, value)).length;

  const filtered = deployments.filter(
    (deployment) =>
      matches(deployment, status) &&
      (environment === "all" || deployment.target === environment) &&
      (!needle ||
        [
          deployment.id,
          deployment.project,
          deployment.branch,
          deployment.commitSha,
          deployment.commitMessage,
          deployment.url,
        ].some((value) => value?.toLowerCase().includes(needle))),
  );
  const running = (deployment: DashboardDeployment) =>
    deployment.status === "Building" || deployment.status === "Queued";
  const live = filtered.filter(running);
  const history = groupByDay(filtered.filter((item) => !running(item)));

  if (!deployments.length) {
    return (
      <DashCard>
        <EmptyState
          description="Push to a connected repository or deploy from a project, and every build lands here with its logs."
          glyph={LiveRocket}
          title="No deployments yet"
        />
      </DashCard>
    );
  }

  return (
    <>
      {/* Running rows update each second, without reloading the page. */}
      <BuildWatcher builds={watchedBuilds(deployments)} />
      <div className="flex flex-wrap items-center gap-2">
        <DashboardSearchInput
          containerClassName="min-w-56 flex-1"
          onValueChange={setQuery}
          placeholder="Search ID, project, branch, commit, address"
          value={query}
        />
        <SegmentedControl
          aria-label="Status"
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: deployments.length },
            { value: "Ready", label: "Ready", count: count("Ready") },
            { value: "Building", label: "Building", count: count("Building") },
            { value: "Failed", label: "Failed", count: count("Failed") },
          ]}
          value={status}
        />
        <SegmentedControl
          aria-label="Environment"
          onChange={setEnvironment}
          options={[
            { value: "all", label: "All" },
            { value: "Production", label: "Production" },
            { value: "Preview", label: "Preview" },
          ]}
          value={environment}
        />
      </div>

      {live.length ? (
        <DashCard aria-label="Building now" className="border-amber-500/30">
          <p className="flex items-center gap-2 px-4 pt-3.5 font-geist-mono text-[10.5px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
            Building now · {live.length}
          </p>
          <div className="p-1.5">
            {live.map((deployment) => (
              <DeploymentRow
                deployment={deployment}
                key={deployment.id}
                workspace={workspace}
              />
            ))}
          </div>
        </DashCard>
      ) : null}

      {history.length ? (
        history.map((group) => (
          <section aria-label={group.label} key={group.key}>
            <p className="mb-2 px-1 font-geist-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
            <DashCard>
              <div className="divide-y divide-hairline p-1.5">
                {group.items.map((deployment) => (
                  <DeploymentRow
                    deployment={deployment}
                    key={deployment.id}
                    workspace={workspace}
                  />
                ))}
              </div>
            </DashCard>
          </section>
        ))
      ) : live.length ? null : (
        <p className="py-14 text-center text-[13px] text-muted-foreground">
          No deployments match these filters.
        </p>
      )}
    </>
  );
}
