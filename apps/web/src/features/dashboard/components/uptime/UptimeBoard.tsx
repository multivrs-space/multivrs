import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveHeartPulse } from "@/components/icons/animated";
import { UptimeMonitorRow } from "@/features/dashboard/components/uptime/UptimeMonitorRow";
import {
  UptimeIncidents,
  UptimeRegions,
} from "@/features/dashboard/components/uptime/UptimeSideCards";
import type {
  RegionLatency,
  UptimeIncident,
  UptimeMonitor,
} from "@/features/dashboard/types/uptime.types";

/**
 * Uptime with checks running: what's up right now, ninety days per check,
 * what broke and for how long, and how each region sees you.
 */
export function UptimeBoard({
  monitors,
  incidents,
  regions,
}: {
  monitors: UptimeMonitor[];
  incidents: UptimeIncident[];
  regions: RegionLatency[];
}) {
  const up = monitors.filter((monitor) => monitor.state === "up").length;
  const open = incidents.filter((incident) => !incident.resolvedAt).length;
  const average =
    monitors.reduce((sum, monitor) => sum + monitor.uptime, 0) /
    Math.max(monitors.length, 1);
  const median =
    [...monitors].sort((a, b) => a.responseMs - b.responseMs)[
      Math.floor(monitors.length / 2)
    ]?.responseMs ?? 0;
  return (
    <div className="space-y-3">
      <StatStrip
        stats={[
          {
            label: "Up now",
            value: `${up}/${monitors.length}`,
            hint: "Checks passing",
            tone: up < monitors.length ? "warn" : "default",
          },
          {
            label: "Uptime",
            value: `${average.toFixed(2)}%`,
            hint: "Average, 30 days",
          },
          {
            label: "Open incidents",
            value: String(open),
            hint: open ? "Still failing" : "All clear",
            tone: open ? "danger" : "default",
          },
          {
            label: "Response",
            value: `${median} ms`,
            hint: "Median across checks",
          },
        ]}
      />
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <DashCard aria-label="Checks" className="lg:col-span-8">
          <DashCardHeader
            description="Every check, with its last 90 days"
            icon={LiveHeartPulse}
            title="Checks"
          />
          <div className="mt-2 divide-y divide-hairline">
            {monitors.map((monitor) => (
              <UptimeMonitorRow key={monitor.id} monitor={monitor} />
            ))}
          </div>
        </DashCard>
        <div className="grid content-start gap-3 lg:col-span-4">
          <UptimeIncidents incidents={incidents} />
          <UptimeRegions regions={regions} />
        </div>
      </div>
    </div>
  );
}
