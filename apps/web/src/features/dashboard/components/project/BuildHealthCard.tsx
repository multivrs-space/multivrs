import { CardAction } from "@/components/dashboard/CardAction";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveSquareTerminal } from "@/components/icons/animated";
import { buildDuration } from "@/features/dashboard/lib/deployment-duration";
import { formatElapsed } from "@/features/dashboard/lib/format-elapsed";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

const seconds = (start: string | null, end: string | null) =>
  start && end
    ? Math.max(0, (Date.parse(end) - Date.parse(start)) / 1_000)
    : null;

/** The last builds as bars: height is how long each took, colour how it ended. */
export function BuildHealthCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const builds = data.recentDeployments
    .filter((item) => item.status === "ready" || item.status === "error")
    .slice(0, 12)
    .reverse();
  const timed = builds.flatMap((item) => {
    const value = seconds(item.startedAt, item.finishedAt);
    return value === null ? [] : [value];
  });
  const longest = Math.max(1, ...timed);
  const passed = builds.filter((item) => item.status === "ready").length;
  const sorted = [...timed].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? null;
  return (
    <DashCard aria-label="Builds">
      <DashCardHeader
        action={
          <CardAction href={`${base}/deployments`} label="All deployments" />
        }
        description={
          builds.length
            ? `Last ${builds.length} builds`
            : "No finished builds yet"
        }
        icon={LiveSquareTerminal}
        title="Builds"
      />
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Went live</p>
          <p className="figure mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">
            {builds.length ? `${passed}/${builds.length}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Typical build</p>
          <p className="figure mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">
            {median === null ? "—" : formatElapsed(Math.round(median))}
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="mt-auto flex h-20 items-end gap-1 px-5 pt-4 pb-5"
      >
        {builds.map((item) => {
          const value = seconds(item.startedAt, item.finishedAt);
          return (
            <span
              className={cn(
                "min-w-1 flex-1 rounded-t-[3px]",
                item.status === "ready" ? "bg-primary/70" : "bg-rose-500/70",
              )}
              key={item.id}
              style={{
                height: `${Math.max(8, ((value ?? 0) / longest) * 100)}%`,
              }}
              title={`${item.branch} · ${buildDuration(item.startedAt, item.finishedAt) ?? "time unknown"}`}
            />
          );
        })}
      </div>
    </DashCard>
  );
}
