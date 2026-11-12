import { FRAMEWORK_IDS } from "@multivrs/config";
import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LivePlus } from "@/components/icons/animated";
import { CreatedBy } from "@/features/dashboard/components/deployments/CreatedBy";
import { FrameworkLogo } from "@/features/dashboard/components/new-project/FrameworkLogo";
import { DeploymentSource } from "@/features/dashboard/components/project/DeploymentSource";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import { buildDuration } from "@/features/dashboard/lib/deployment-duration";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type {
  ProjectOverviewData,
  ProjectOverviewDeployment,
} from "@/features/dashboard/types/project-overview.types";

function Fact({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "min-w-0 sm:col-span-2" : "min-w-0"}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 text-[13px] text-foreground">{children}</dd>
    </div>
  );
}

const bare = (url: string) => url.replace(/^https?:\/\//, "");

/** Address, domains, state, timing, source and framework of what's live. */
export function ProductionFacts({
  base,
  data,
  production,
}: {
  base: string;
  data: ProjectOverviewData;
  production: ProjectOverviewDeployment;
}) {
  const duration = buildDuration(production.startedAt, production.finishedAt);
  const framework = FRAMEWORK_IDS.find((id) => id === data.framework) ?? null;
  const domains = [
    ...(data.address
      ? [{ hostname: bare(data.address), status: "Active" }]
      : []),
    ...data.domains,
  ];
  return (
    <dl className="grid content-start gap-x-6 gap-y-4 sm:grid-cols-2">
      <Fact label="Deployment" wide>
        {production.url ? (
          <span className="flex min-w-0 items-center gap-1">
            <a
              className="truncate font-geist-mono text-[12.5px] hover:underline"
              href={production.url}
              rel="noreferrer"
              target="_blank"
            >
              {bare(production.url)}
            </a>
            <CopyButton className="size-7 shrink-0" text={production.url} />
          </span>
        ) : (
          <span className="text-muted-foreground">No unique address</span>
        )}
      </Fact>
      <Fact label="Domains" wide>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {domains.slice(0, 3).map((domain) => (
            <a
              className="flex items-center gap-1.5 font-geist-mono text-[12.5px] hover:underline"
              href={`https://${domain.hostname}`}
              key={domain.hostname}
              rel="noreferrer"
              target="_blank"
            >
              <StatusOrb
                label={domain.status}
                tone={domain.status === "Active" ? "ready" : "building"}
              />
              {domain.hostname}
            </a>
          ))}
          {domains.length > 3 ? (
            <span className="text-xs text-muted-foreground">
              +{domains.length - 3} more
            </span>
          ) : null}
          <Link
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            data-icon-trigger
            href={`${base}/domains`}
          >
            <LivePlus className="size-3" strokeWidth={2.25} /> Add
          </Link>
        </span>
      </Fact>
      <Fact label="Status">
        <span className="flex items-center gap-2">
          <StatusOrb label="Ready" tone="ready" /> Ready
          {duration ? (
            <span className="text-muted-foreground">· built in {duration}</span>
          ) : null}
        </span>
      </Fact>
      <Fact label="Created">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <time
            dateTime={production.createdAt}
            title={fullTimestamp(production.createdAt)}
          >
            {relativeTime(production.createdAt)}
          </time>
          <CreatedBy creator={production.createdBy} />
        </span>
      </Fact>
      <Fact label="Source" wide>
        <DeploymentSource
          branch={production.branch}
          commitSha={production.commitSha}
          repositoryUrl={data.repositoryUrl}
        />
      </Fact>
      <Fact label="Framework">
        <span className="flex items-center gap-1.5">
          {framework ? (
            <FrameworkLogo className="size-3.5" framework={framework} />
          ) : null}
          {framework ? FRAMEWORK_LABELS[framework] : "Not set"}
        </span>
      </Fact>
      <Fact label="Target">
        <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary">
          Production
        </span>
      </Fact>
    </dl>
  );
}
