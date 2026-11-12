import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { LiveListFilter } from "@/components/icons/animated";
import type { ProductEventRow } from "@/features/dashboard/types/product-analytics.types";

/**
 * Each event with its reach: how many people did it, how often, and what
 * share of visitors that is, with its trend over the range.
 */
export function ProductEventsTable({
  rows,
  visitors,
  className,
}: {
  rows: ProductEventRow[];
  visitors: number;
  className?: string;
}) {
  return (
    <DashCard aria-label="Events" className={className}>
      <DashCardHeader
        description={`${rows.length} ${rows.length === 1 ? "event" : "events"}, busiest first`}
        icon={LiveListFilter}
        title="Events"
      />
      <div className="overflow-x-auto p-2 pt-3">
        <table className="w-full min-w-[620px] text-[12.5px]">
          <thead>
            <tr className="text-left font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
              <th className="w-[34%] px-3 py-2 font-normal">Event</th>
              <th className="px-3 py-2 text-right font-normal">People</th>
              <th className="px-3 py-2 text-right font-normal">Events</th>
              <th className="px-3 py-2 text-right font-normal">Per person</th>
              <th className="w-40 px-3 py-2 font-normal">Reach</th>
              <th className="w-28 px-3 py-2 font-normal">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row) => {
              const reach = visitors ? Math.min(row.users / visitors, 1) : 0;
              return (
                <tr
                  className="transition-colors hover:bg-foreground/[0.025]"
                  key={row.name}
                >
                  <td className="max-w-0 truncate px-3 py-3 font-geist-mono text-foreground">
                    {row.name}
                  </td>
                  <td className="figure px-3 py-3 text-right font-semibold">
                    {formatCompact(row.users)}
                  </td>
                  <td className="figure px-3 py-3 text-right">
                    {formatCompact(row.events)}
                  </td>
                  <td className="figure px-3 py-3 text-right text-muted-foreground">
                    {row.users ? (row.events / row.users).toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${reach * 100}%` }}
                        />
                      </span>
                      <span className="figure w-10 text-right text-[11px] text-muted-foreground">
                        {visitors ? formatPercent(reach * 100, 0) : "—"}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline
                      className="h-7 w-24"
                      label={`${row.name} over the range`}
                      tone="muted"
                      values={row.trend}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
}
