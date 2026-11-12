import { uniqueKeys } from "@/components/dashboard/lib/chart-math";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveCalendarDays,
  LiveGlobe,
  LiveHistory,
  LiveWorkflow,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import { describeCron } from "@/features/dashboard/lib/workflow-steps";
import type { DashboardWorkflow } from "@/features/dashboard/types/platform-workflow.types";

const RUN_TONE: Record<
  string,
  "ready" | "building" | "error" | "queued" | "idle"
> = {
  completed: "ready",
  succeeded: "ready",
  running: "building",
  queued: "queued",
  failed: "error",
};

const NEXT_RUN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** A workflow as its chain of steps, its schedule and its latest run. */
export function WorkflowCard({
  workflow,
  pending,
  onRun,
}: {
  workflow: DashboardWorkflow;
  pending: boolean;
  onRun: () => void;
}) {
  const latest = workflow.runs[0];
  const schedule = workflow.schedules[0];
  const keys = uniqueKeys(workflow.steps.map((step) => step.name));
  return (
    <article
      className="surface-card flex flex-col gap-4 rounded-card p-4"
      data-dash-card
    >
      <div className="flex items-start gap-3">
        <span
          className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-primary"
          data-card-icon
        >
          <LiveWorkflow className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.015em]">
            {workflow.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
            {latest ? (
              <>
                <StatusOrb
                  label={latest.status}
                  tone={RUN_TONE[latest.status] ?? "idle"}
                />
                <span className="capitalize">{latest.status}</span> ·{" "}
                {relativeTime(latest.createdAt)}
              </>
            ) : (
              "Never run"
            )}
          </p>
        </div>
        <Button
          data-icon-trigger
          disabled={pending}
          onClick={onRun}
          size="sm"
          variant="raised"
        >
          Run
        </Button>
      </div>

      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Steps">
        {workflow.steps.map((step, index) => (
          <li className="flex items-center gap-1.5" key={keys[index]}>
            {index ? (
              <span
                aria-hidden="true"
                className="h-px w-3 bg-hairline-strong"
              />
            ) : null}
            <span className="surface-inset flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11.5px]">
              {step.type === "http" ? (
                <LiveGlobe
                  className="size-3 text-muted-foreground"
                  strokeWidth={2}
                />
              ) : (
                <LiveHistory
                  className="size-3 text-muted-foreground"
                  strokeWidth={2}
                />
              )}
              <span className="max-w-36 truncate">{step.name}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-hairline pt-3 text-[12px] text-muted-foreground">
        <LiveCalendarDays className="size-3.5" strokeWidth={1.75} />
        {schedule ? (
          <>
            <span className="text-foreground">
              {describeCron(schedule.expression) ?? schedule.expression}
            </span>
            <span className="font-geist-mono text-[11px]">
              ({schedule.expression})
            </span>
            <span className="ml-auto font-geist-mono text-[11px]">
              Next {NEXT_RUN.format(new Date(schedule.nextRunAt))} UTC
            </span>
          </>
        ) : (
          "Runs when triggered"
        )}
      </p>
    </article>
  );
}
