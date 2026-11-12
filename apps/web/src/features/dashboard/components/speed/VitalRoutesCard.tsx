import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveSearchCode } from "@/components/icons/animated";
import {
  formatVital,
  type VitalName,
  vitalRating,
} from "@/features/dashboard/lib/web-vitals";
import type { WebVitalRoute } from "@/features/dashboard/types/analytics.types";
import { cn } from "@/lib/utils";

const COLUMNS: VitalName[] = ["LCP", "INP", "CLS", "TTFB"];

const CHIP = {
  good: "text-emerald-700 dark:text-emerald-300",
  "needs-improvement": "text-amber-700 dark:text-amber-300",
  poor: "text-rose-700 dark:text-rose-300",
};

function Cell({ name, value }: { name: VitalName; value: number | undefined }) {
  if (value === undefined)
    return <span className="text-muted-foreground/60">—</span>;
  const rating = vitalRating(name, value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        CHIP[rating],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatVital(name, value)}
    </span>
  );
}

/** Each route's vitals, coloured by rating, so slow pages stand out. */
export function VitalRoutesCard({
  routes,
  className,
}: {
  routes: WebVitalRoute[];
  className?: string;
}) {
  return (
    <DashCard aria-label="Performance by route" className={className}>
      <DashCardHeader
        description="75th percentile per route, busiest first"
        icon={LiveSearchCode}
        title="Performance by route"
      />
      <div className="overflow-x-auto p-5 pt-4">
        {routes.length ? (
          <table className="w-full min-w-[560px] text-left text-[12.5px]">
            <thead>
              <tr className="font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                <th className="pb-2 font-normal">Route</th>
                {COLUMNS.map((name) => (
                  <th className="pb-2 font-normal" key={name}>
                    {name}
                  </th>
                ))}
                <th className="pb-2 text-right font-normal">Samples</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr
                  className="border-t border-hairline transition-colors hover:bg-foreground/[0.025]"
                  key={route.path}
                >
                  <td
                    className="max-w-64 truncate py-2.5 pr-3 font-geist-mono text-[12px]"
                    title={route.path}
                  >
                    {route.path}
                  </td>
                  {COLUMNS.map((name) => (
                    <td className="py-2.5" key={name}>
                      <Cell name={name} value={route.metrics[name]} />
                    </td>
                  ))}
                  <td className="figure py-2.5 text-right text-muted-foreground">
                    {route.samples.toLocaleString("en")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            Route performance appears after real visits.
          </p>
        )}
      </div>
    </DashCard>
  );
}
