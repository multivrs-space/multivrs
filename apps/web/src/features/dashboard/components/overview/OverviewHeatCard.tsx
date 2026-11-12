import { HeatGrid, HeatLegend } from "@/components/dashboard/charts/HeatGrid";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { LiveCalendarDays } from "@/components/icons/animated";
import { overviewViewer } from "@/features/dashboard/components/overview/overview-data";
import {
  dayparts,
  heatBlocks,
  heatLevel,
  WEEKDAYS,
} from "@/features/dashboard/lib/overview-heat";
import type { TrafficHeat } from "@/features/dashboard/types/overview.types";
import { workspaceTrafficHeat } from "@/lib/services/workspace-overview.service";

/** Night to evening, light to full brand colour, matching the swatches. */
const EMPTY_BLOCKS = [
  "21:00",
  "18:00",
  "15:00",
  "12:00",
  "09:00",
  "06:00",
  "03:00",
  "00:00",
];

const PART_COLOURS = [
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary",
  "bg-primary/75",
];

/** When requests arrive, by UTC weekday and three-hour block, over 28 days. */
export async function OverviewHeatCard({
  username: workspace,
  className,
}: {
  /** The workspace slug from the route's params, awaited inside this card's Suspense. */
  username: Promise<string>;
  className?: string;
}) {
  const username = await workspace;
  const { userId } = await overviewViewer(username);
  return (
    <OverviewHeatView
      className={className}
      heat={await workspaceTrafficHeat(userId, username)}
    />
  );
}

export function OverviewHeatView({
  heat,
  className,
}: {
  heat: TrafficHeat | null;
  className?: string;
}) {
  const blocks = heat ? heatBlocks(heat) : [];
  const max = Math.max(0, ...blocks.flatMap((block) => block.values));
  const parts = heat ? dayparts(heat) : [];
  return (
    <DashCard aria-label="When traffic arrives" className={className}>
      <DashCardHeader
        description="Last 28 days, in UTC"
        icon={LiveCalendarDays}
        title="When traffic arrives"
      />
      {heat && heat.total > 0 ? (
        <div className="space-y-4 p-5 pt-4">
          <HeatLegend />
          <HeatGrid
            columns={WEEKDAYS}
            label="Requests by weekday and time of day"
            rows={blocks.map((block) => ({
              label: block.label,
              cells: block.values.map((value, day) => ({
                level: heatLevel(value, max),
                title: `${WEEKDAYS[day]} ${block.label} UTC · ${formatCompact(value)} requests`,
              })),
            }))}
          />
          <div>
            <div
              aria-hidden="true"
              className="flex h-1.5 gap-0.5 overflow-hidden rounded-full"
            >
              {parts.map((part, index) => (
                <span
                  className={PART_COLOURS[index]}
                  key={part.label}
                  style={{ width: `${part.share}%` }}
                />
              ))}
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-2">
              {parts.map((part) => (
                <div key={part.label}>
                  <dd className="figure text-[19px] font-semibold leading-none">
                    {formatPercent(part.share, 0)}
                  </dd>
                  <dt className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <span
                      className={`size-2 rounded-full ${PART_COLOURS[parts.indexOf(part)]}`}
                    />
                    {part.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <div className="relative p-5 pt-4">
          {/* The empty grid shows what will fill in, hatched like quiet hours. */}
          <HeatGrid
            columns={WEEKDAYS}
            label="Requests by weekday and time of day (none yet)"
            rows={EMPTY_BLOCKS.map((label) => ({
              label,
              cells: WEEKDAYS.map((day) => ({
                level: 0,
                title: `${day} ${label} UTC · no requests`,
              })),
            }))}
          />
          <p className="surface-raised absolute left-1/2 top-1/2 max-w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-center text-[12.5px] text-muted-foreground">
            {heat
              ? "Fills in as visitors arrive, busiest hours darkest."
              : "Shows up once request analytics is connected."}
          </p>
        </div>
      )}
    </DashCard>
  );
}
