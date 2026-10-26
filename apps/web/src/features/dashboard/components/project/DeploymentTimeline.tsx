import { GitCommitHorizontal } from "lucide-react";
import Link from "next/link";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

/** Recent deployments as a connected history, newest first. */
export function DeploymentTimeline({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const productionId = data.production?.id;
  return (
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised)">
      <div className="flex items-center justify-between border-b border-(--hairline) px-5 py-3.5">
        <h2 className="text-sm font-semibold">History</h2>
        <Link
          href={`${base}/deployments`}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          All deployments
        </Link>
      </div>
      {data.recentDeployments.length ? (
        <ol className="relative px-5 py-4">
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[27px] top-6 w-px bg-(--hairline-strong)"
          />
          {data.recentDeployments.map((item) => {
            const status = deploymentStatus(item.status);
            return (
              <li key={item.id} className="relative">
                <Link
                  href={`${base}/deployments/${item.id}`}
                  className="group flex gap-4 rounded-lg py-2.5 pr-2 transition-colors hover:bg-foreground/[0.03]"
                >
                  <span
                    className={cn(
                      "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-(--ink-raised)",
                      status.dot,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {item.id.slice(0, 8)}
                      </span>
                      {item.id === productionId ? (
                        <span className="rounded-sm bg-primary/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-primary">
                          Production
                        </span>
                      ) : null}
                      <span className={cn("ml-auto text-[11px]", status.text)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                      <GitCommitHorizontal className="size-3 shrink-0" />
                      {item.branch}
                      {item.commitSha ? ` · ${item.commitSha.slice(0, 7)}` : ""}{" "}
                      · {relativeTime(item.createdAt)}
                    </p>
                    {item.status === "error" && item.errorMessage ? (
                      <p className="mt-1.5 line-clamp-1 font-mono text-[11px] text-rose-300/70">
                        {item.errorMessage}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="px-5 py-10 text-center text-xs text-muted-foreground">
          Deployments appear here after the first push.
        </p>
      )}
    </section>
  );
}
