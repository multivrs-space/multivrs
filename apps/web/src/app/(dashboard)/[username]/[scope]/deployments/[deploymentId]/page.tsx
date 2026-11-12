import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveArrowLeft,
  LiveArrowUpRight,
  LiveTriangleAlert,
} from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DeploymentSummary } from "@/features/dashboard/components/deployments/DeploymentSummary";
import { LiveBuildLog } from "@/features/dashboard/components/deployments/LiveBuildLog";
import { RedeployButton } from "@/features/dashboard/components/deployments/RedeployButton";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import { getServerSession } from "@/lib/auth/session";
import { dashboardDeploymentDetail } from "@/lib/services/deployment-detail.service";

interface PageProps {
  params: Promise<{ username: string; scope: string; deploymentId: string }>;
}

export default async function DeploymentDetailPage({ params }: PageProps) {
  const { username, scope, deploymentId } = await params;
  const session = await getServerSession();
  if (!session) notFound();
  const deployment = await dashboardDeploymentDetail(
    session.user.id,
    username,
    scope,
    deploymentId,
  );
  if (!deployment) notFound();
  const status = deploymentStatus(deployment.status);
  const running =
    deployment.status === "queued" || deployment.status === "building";

  return (
    <PageBody>
      <Link
        className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        data-icon-trigger
        href={`/${username}/${scope}/deployments`}
      >
        <LiveArrowLeft className="size-3.5" strokeWidth={2} />
        Deployments
      </Link>
      <DashboardPageHeader
        actions={
          <>
            {deployment.hasRepository && !running ? (
              <RedeployButton
                source={{
                  projectId: deployment.projectId,
                  deploymentId: deployment.id,
                  branch: deployment.branch,
                  target: deployment.target,
                  deploymentsHref: `/${username}/${scope}/deployments`,
                }}
              />
            ) : null}
            {deployment.url ? (
              <>
                <span className="surface-inset flex h-9 items-center gap-1 rounded-full pl-3.5 pr-1 font-geist-mono text-xs">
                  <span className="max-w-64 truncate">
                    {deployment.url.replace(/^https?:\/\//, "")}
                  </span>
                  <CopyButton className="size-7" text={deployment.url} />
                </span>
                <a
                  className={buttonVariants({ size: "sm", variant: "hero" })}
                  data-icon-trigger
                  href={deployment.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open
                  <LiveArrowUpRight strokeWidth={2} />
                </a>
              </>
            ) : null}
          </>
        }
        eyebrow={`${deployment.project} · ${deployment.branch}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Deployment{" "}
            <span className="font-geist-mono text-[0.8em]">
              {deployment.id.slice(0, 8)}
            </span>
            <StatusOrb label={status.label} pill tone={status.tone} />
          </span>
        }
      />
      <DeploymentSummary deployment={deployment} status={status} />
      {deployment.errorMessage ? (
        <div
          className="flex gap-3 rounded-card border border-rose-500/25 bg-rose-500/[0.06] p-4"
          data-icon-trigger
        >
          <LiveTriangleAlert
            className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400"
            strokeWidth={1.75}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-rose-700 dark:text-rose-200">
              Build failed
            </p>
            <p className="mt-1 break-words font-geist-mono text-[12px] leading-relaxed text-rose-700/85 dark:text-rose-200/75">
              {deployment.errorMessage}
            </p>
          </div>
        </div>
      ) : null}
      <LiveBuildLog
        createdAt={deployment.createdAt}
        deploymentId={deployment.id}
        initialLogs={deployment.logs}
        initialStatus={deployment.status}
        key={deployment.id}
        projectId={deployment.projectId}
      />
    </PageBody>
  );
}
