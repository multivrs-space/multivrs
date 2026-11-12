import Link from "next/link";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveArrowUpRight, LiveRocket } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { RedeployButton } from "@/features/dashboard/components/deployments/RedeployButton";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { NoProductionCard } from "@/features/dashboard/components/project/NoProductionCard";
import { ProductionFacts } from "@/features/dashboard/components/project/ProductionFacts";
import { SitePreview } from "@/features/dashboard/components/project/SitePreview";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

/** What production is serving right now, and everything about how it got there. */
export function ProductionCard({
  base,
  data,
  username,
}: {
  base: string;
  data: ProjectOverviewData;
  username: string;
}) {
  const production = data.production;
  if (!production)
    return <NoProductionCard base={base} data={data} username={username} />;
  const address = data.address ?? production.url;
  return (
    <DashCard aria-label="Production deployment">
      <DashCardHeader
        action={
          <>
            {data.repositoryUrl ? (
              <a
                aria-label="Open the repository"
                className={buttonVariants({
                  size: "icon-sm",
                  variant: "raised",
                })}
                href={data.repositoryUrl}
                rel="noreferrer"
                target="_blank"
              >
                <GitHubMark className="size-3.5" />
              </a>
            ) : null}
            {data.repositoryUrl ? (
              <RedeployButton
                source={{
                  projectId: data.id,
                  deploymentId: production.id,
                  branch: production.branch,
                  target: "production",
                  deploymentsHref: `${base}/deployments`,
                }}
              />
            ) : null}
            {address ? (
              <a
                className={buttonVariants({ size: "sm", variant: "hero" })}
                data-icon-trigger
                href={address}
                rel="noreferrer"
                target="_blank"
              >
                Visit <LiveArrowUpRight strokeWidth={2} />
              </a>
            ) : null}
          </>
        }
        description={`Live since ${relativeTime(production.finishedAt ?? production.createdAt)}`}
        icon={LiveRocket}
        title="Production deployment"
      />
      <div className="grid gap-6 p-5 pt-4 lg:grid-cols-12">
        {address ? (
          <div className="lg:col-span-5">
            <SitePreview
              address={address}
              faviconUrl={data.faviconUrl}
              name={data.name}
              previewUrl={`/api/projects/${data.id}/deployments/${production.id}/preview`}
            />
          </div>
        ) : null}
        <div className={address ? "lg:col-span-7" : "lg:col-span-12"}>
          <ProductionFacts base={base} data={data} production={production} />
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-5 py-3 text-xs text-muted-foreground">
        <p>
          {data.repositoryUrl ? (
            <>
              To update production, push to{" "}
              <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-geist-mono text-[11px] text-foreground">
                {production.branch}
              </code>
              .
            </>
          ) : (
            "Connect a repository in Settings to deploy on every push."
          )}
        </p>
        <span className="flex items-center gap-2">
          <Link
            className={buttonVariants({ size: "xs", variant: "quiet" })}
            href={`${base}/deployments/${production.id}`}
          >
            Build log
          </Link>
          <Link
            className={buttonVariants({ size: "xs", variant: "raised" })}
            href={`${base}/deployments`}
          >
            All deployments
          </Link>
        </span>
      </footer>
    </DashCard>
  );
}
