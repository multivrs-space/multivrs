import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveEarth, LiveTriangleAlert } from "@/components/icons/animated";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type {
  RegionLatency,
  UptimeIncident,
} from "@/features/dashboard/types/uptime.types";
import { cn } from "@/lib/utils";

function lasted(incident: UptimeIncident): string {
  if (!incident.resolvedAt) return "Ongoing";
  const minutes = Math.max(
    1,
    Math.round(
      (Date.parse(incident.resolvedAt) - Date.parse(incident.startedAt)) /
        60_000,
    ),
  );
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/** Outages newest first, ongoing ones lit. */
export function UptimeIncidents({
  incidents,
}: {
  incidents: UptimeIncident[];
}) {
  return (
    <DashCard aria-label="Incidents">
      <DashCardHeader
        description="Last 30 days"
        icon={LiveTriangleAlert}
        title="Incidents"
      />
      <ol className="space-y-1 p-2 pt-3">
        {incidents.map((incident) => (
          <li
            className="flex gap-3 rounded-tile px-3 py-2.5 hover:bg-foreground/[0.025]"
            key={incident.id}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                incident.resolvedAt
                  ? "bg-muted-foreground/40"
                  : "animate-pulse bg-rose-500",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">
                {incident.monitor}
              </span>
              <span className="block truncate text-[11.5px] text-muted-foreground">
                {incident.cause} · {incident.regions.join(", ")}
              </span>
            </span>
            <span className="shrink-0 text-right font-geist-mono text-[11px] text-muted-foreground">
              <time
                dateTime={incident.startedAt}
                title={fullTimestamp(incident.startedAt)}
              >
                {relativeTime(incident.startedAt)}
              </time>
              <span
                className={cn(
                  "block",
                  !incident.resolvedAt && "text-rose-600 dark:text-rose-400",
                )}
              >
                {lasted(incident)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </DashCard>
  );
}

/** How fast each region gets an answer, slowest last. */
export function UptimeRegions({ regions }: { regions: RegionLatency[] }) {
  const max = Math.max(...regions.map((region) => region.ms), 1);
  return (
    <DashCard aria-label="Response by region">
      <DashCardHeader
        description="Median, last 24 hours"
        icon={LiveEarth}
        title="From around the world"
      />
      <ul className="space-y-3 p-5 pt-4">
        {[...regions]
          .sort((a, b) => a.ms - b.ms)
          .map((region) => (
            <li
              className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 text-[12px]"
              key={region.region}
            >
              <span className="truncate">
                {region.city}
                <span className="ml-1 font-geist-mono text-[10px] text-muted-foreground">
                  {region.region}
                </span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    region.ms > 600 ? "bg-amber-500" : "bg-primary",
                  )}
                  style={{ width: `${(region.ms / max) * 100}%` }}
                />
              </span>
              <span className="figure text-right font-medium">
                {region.ms} ms
              </span>
            </li>
          ))}
      </ul>
    </DashCard>
  );
}
