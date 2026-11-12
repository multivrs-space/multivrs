import { type OrbTone, StatusOrb } from "@/components/dashboard/StatusOrb";
import { UptimeDays } from "@/features/dashboard/components/uptime/UptimeDays";
import type {
  UptimeMonitor,
  UptimeState,
} from "@/features/dashboard/types/uptime.types";

const STATE: Record<UptimeState, { tone: OrbTone; label: string }> = {
  up: { tone: "ready", label: "Up" },
  degraded: { tone: "building", label: "Degraded" },
  down: { tone: "error", label: "Down" },
  paused: { tone: "idle", label: "Paused" },
};

function every(seconds: number) {
  return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)} min`;
}

/** One monitor: its state, ninety days of history and how fast it answers. */
export function UptimeMonitorRow({ monitor }: { monitor: UptimeMonitor }) {
  const state = STATE[monitor.state];
  return (
    <div className="grid gap-x-5 gap-y-3 px-4 py-4 transition-colors hover:bg-foreground/[0.02] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_5rem_5rem] lg:items-center">
      <div className="min-w-0">
        <p className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-medium">
            {monitor.name}
          </span>
          <StatusOrb label={state.label} pill tone={state.tone} />
        </p>
        <p className="mt-1 truncate font-geist-mono text-[11px] text-muted-foreground">
          {monitor.kind === "synthetic" ? "Synthetic · " : ""}
          {monitor.url} · every {every(monitor.intervalSeconds)} ·{" "}
          {monitor.regions.length} regions
        </p>
      </div>
      <UptimeDays days={monitor.days} />
      <p className="lg:text-right">
        <span className="figure block text-[15px] font-semibold">
          {monitor.uptime.toFixed(2)}%
        </span>
        <span className="text-[10.5px] text-muted-foreground">30 days</span>
      </p>
      <p className="lg:text-right">
        <span className="figure block text-[15px] font-semibold">
          {monitor.responseMs ? `${monitor.responseMs} ms` : "—"}
        </span>
        <span className="text-[10.5px] text-muted-foreground">median</span>
      </p>
    </div>
  );
}
