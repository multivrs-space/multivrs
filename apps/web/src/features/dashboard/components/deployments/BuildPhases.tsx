import {
  type AnimatedIcon,
  LiveBoxes,
  LiveDownload,
  LiveRocket,
  LiveSquareTerminal,
} from "@/components/icons/animated";
import { LiveElapsed } from "@/features/dashboard/components/deployments/LiveElapsed";
import type {
  BuildPhase,
  BuildPhaseId,
  BuildPhaseState,
} from "@/features/dashboard/lib/build-phases";
import { cn } from "@/lib/utils";

const ICONS: Record<BuildPhaseId, AnimatedIcon> = {
  machine: LiveBoxes,
  install: LiveDownload,
  build: LiveSquareTerminal,
  deploy: LiveRocket,
};

const RUNNING: Record<BuildPhaseId, string> = {
  machine: "Getting a machine",
  install: "Installing",
  build: "Building",
  deploy: "Going live",
};

const STATE_TEXT: Record<Exclude<BuildPhaseState, "running">, string> = {
  done: "Done",
  failed: "Stopped here",
  skipped: "Not needed",
  waiting: "Waiting",
};

/**
 * Set up → Install → Build → Deploy, each lit by the build's own log lines.
 * The bar under each step is the progress track: full when done, sweeping
 * while it runs, empty while it waits.
 */
export function BuildPhases({
  phases,
  since,
  className,
}: {
  phases: readonly BuildPhase[];
  /** When the build was asked for: the clock for a step with no line yet. */
  since?: string;
  className?: string;
}) {
  return (
    <ol
      aria-label="Build steps"
      className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}
    >
      {phases.map((phase) => (
        <PhaseStep key={phase.id} phase={phase} since={since} />
      ))}
    </ol>
  );
}

function PhaseStep({ phase, since }: { phase: BuildPhase; since?: string }) {
  const Icon = ICONS[phase.id];
  const running = phase.state === "running";
  const failed = phase.state === "failed";
  const quiet = phase.state === "waiting" || phase.state === "skipped";
  const clockFrom = running ? (phase.startedAt ?? since) : undefined;
  return (
    <li
      aria-current={running ? "step" : undefined}
      className={cn(
        "surface-inset relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-tile p-3",
        quiet && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-[9px] border",
            running &&
              "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
            failed &&
              "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
            phase.state === "done" &&
              "border-primary/25 bg-primary/10 text-primary",
            quiet && "border-hairline text-muted-foreground",
          )}
          data-icon-loop={running ? "" : undefined}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span className="font-geist-mono text-[11.5px] text-muted-foreground">
          {clockFrom ? (
            <LiveElapsed since={clockFrom} />
          ) : (
            (phase.duration ?? "")
          )}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
          {phase.label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-[11.5px]",
            running
              ? "text-amber-700 dark:text-amber-300"
              : failed
                ? "text-rose-700 dark:text-rose-300"
                : "text-muted-foreground",
          )}
        >
          {phase.state === "running"
            ? `${RUNNING[phase.id]}…`
            : STATE_TEXT[phase.state]}
        </p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 overflow-hidden",
          running && "bg-amber-500/15",
          failed && "bg-rose-500/60",
          phase.state === "done" && "bg-primary/70",
        )}
      >
        {running ? (
          <span className="block h-full w-1/3 animate-[deploy-progress_1.6s_ease-in-out_infinite] bg-amber-500/80 motion-reduce:animate-none" />
        ) : null}
      </span>
    </li>
  );
}
