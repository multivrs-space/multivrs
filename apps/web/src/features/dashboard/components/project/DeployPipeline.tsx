import {
  ArrowRight,
  GitBranch,
  Globe2,
  Hammer,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import {
  type DeploymentTone,
  deploymentStatus,
} from "@/features/dashboard/lib/deployment-status";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

interface Stage {
  icon: typeof Globe2;
  title: string;
  detail: string;
  tone: DeploymentTone;
}

function stages(data: ProjectOverviewData): Stage[] {
  const latest = data.recentDeployments[0];
  const tone = deploymentStatus(latest?.status).tone;
  const sourceDetail = latest
    ? `${latest.branch}${latest.commitSha ? ` · ${latest.commitSha.slice(0, 7)}` : ""}`
    : "Waiting for a push";
  const buildDetail = !latest
    ? "Not started"
    : {
        ready: "Built",
        building: "In progress",
        error: "Failed",
        idle: "Stopped",
      }[tone];
  return [
    {
      icon: GitBranch,
      title: "Source",
      detail: sourceDetail,
      tone: latest ? "ready" : "idle",
    },
    {
      icon: Hammer,
      title: "Build",
      detail: buildDetail,
      tone: latest ? tone : "idle",
    },
    {
      icon: Globe2,
      title: "Edge",
      detail: tone === "ready" ? "Serving traffic" : "Not live",
      tone: tone === "ready" ? "ready" : "idle",
    },
  ];
}

/** Staggered reveal, left to right. */
const STAGGER = ["delay-0", "delay-100", "delay-200"];

const NODE_TONE: Record<DeploymentTone, string> = {
  ready: "border-emerald-400/40 text-emerald-300",
  building: "border-amber-300/50 text-amber-200 animate-pulse",
  error: "border-rose-400/50 text-rose-300",
  idle: "border-(--hairline) text-muted-foreground",
};

/** The latest deployment as a three-stage pipeline, with its failure inline. */
export function DeployPipeline({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const latest = data.recentDeployments[0];
  const failed = latest?.status === "error";
  return (
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised)">
      <div className="flex items-center justify-between border-b border-(--hairline) px-5 py-3.5">
        <h2 className="text-sm font-semibold">Latest deployment</h2>
        {latest ? (
          <Link
            href={`${base}/deployments/${latest.id}`}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
          >
            {latest.id.slice(0, 8)} · {relativeTime(latest.createdAt)}
            <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>
      <ol className="grid gap-px bg-(--hairline) sm:grid-cols-3">
        {stages(data).map((stage, index) => (
          <li
            key={stage.title}
            className={cn(
              "relative flex items-center gap-3 bg-(--ink-raised) px-5 py-5 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500",
              STAGGER[index],
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border bg-black",
                NODE_TONE[stage.tone],
              )}
            >
              <stage.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {stage.title}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium">
                {stage.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {failed ? (
        <div className="flex gap-3 border-t border-rose-400/15 bg-rose-500/[0.04] px-5 py-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-rose-200">
              Build failed
            </p>
            <p className="mt-1 line-clamp-3 break-words font-mono text-[11px] leading-relaxed text-rose-200/70">
              {latest.errorMessage ??
                "The build stopped without an error message."}
            </p>
          </div>
          <Link
            href={`${base}/deployments/${latest.id}`}
            className="self-start whitespace-nowrap text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            View logs
          </Link>
        </div>
      ) : null}
    </section>
  );
}
