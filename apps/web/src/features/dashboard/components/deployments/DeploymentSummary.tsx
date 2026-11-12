import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  type AnimatedIcon,
  LiveCalendarDays,
  LiveGitBranch,
  LiveGlobe,
  LiveRocket,
} from "@/components/icons/animated";
import { CreatedBy } from "@/features/dashboard/components/deployments/CreatedBy";
import type { DeploymentStatusStyle } from "@/features/dashboard/lib/deployment-status";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type { DashboardDeploymentDetail } from "@/lib/services/deployment-detail.types";

interface Fact {
  label: string;
  icon: AnimatedIcon;
  value: React.ReactNode;
}

/** Status, source, timing and address of one deployment, side by side. */
export function DeploymentSummary({
  deployment,
  status,
}: {
  deployment: DashboardDeploymentDetail;
  status: DeploymentStatusStyle;
}) {
  const facts: Fact[] = [
    {
      label: "Status",
      icon: LiveRocket,
      value: (
        <span className="flex items-center gap-2">
          <StatusOrb label={status.label} tone={status.tone} />
          {status.label}
        </span>
      ),
    },
    {
      label: "Source",
      icon: LiveGitBranch,
      value: (
        <span className="font-geist-mono text-[12.5px]">
          {deployment.branch}
          {deployment.commitSha ? ` · ${deployment.commitSha.slice(0, 7)}` : ""}
        </span>
      ),
    },
    {
      label: "Created",
      icon: LiveCalendarDays,
      value: (
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <time
            dateTime={deployment.createdAt}
            title={fullTimestamp(deployment.createdAt)}
          >
            {relativeTime(deployment.createdAt)}
          </time>
          <CreatedBy creator={deployment.createdBy} />
        </span>
      ),
    },
    {
      label: "Address",
      icon: LiveGlobe,
      value: deployment.url ? (
        <a
          className="truncate font-geist-mono text-[12.5px] hover:underline"
          href={deployment.url}
          rel="noreferrer"
          target="_blank"
        >
          {deployment.url.replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="text-muted-foreground">Not assigned</span>
      ),
    },
  ];

  return (
    <div className="surface-card overflow-hidden rounded-card">
      <dl className="grid gap-px bg-hairline sm:grid-cols-2 xl:grid-cols-4">
        {facts.map((fact) => (
          <div
            className="flex min-w-0 flex-col gap-2 bg-card p-4"
            data-icon-trigger
            key={fact.label}
          >
            <dt className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <fact.icon className="size-3.5" strokeWidth={1.75} />
              {fact.label}
            </dt>
            <dd className="min-w-0 truncate text-[14px] font-medium">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
