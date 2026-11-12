import { DashCard } from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";
import { cn } from "@/lib/utils";

/**
 * People on the site in the last five minutes, then how deep a visit goes.
 * The dot only pulses while someone is actually there.
 */
export function AnalyticsLiveCard({
  live,
  data,
  className,
}: {
  live: number;
  data: PlatformAnalytics;
  className?: string;
}) {
  const perVisit = data.sessions ? data.pageviews / data.sessions : 0;
  return (
    <DashCard aria-label="Live now" className={className} tone="glass">
      <div className="flex h-full flex-col p-5">
        <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <span className="relative grid size-2.5 place-items-center">
            {live ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
            ) : null}
            <span
              className={cn(
                "relative size-2 rounded-full",
                live ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
            />
          </span>
          Live now
        </p>
        <p className="figure mt-3 text-[34px] font-semibold leading-none tracking-[-0.03em]">
          {formatCompact(live)}
        </p>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          {live === 1 ? "visitor" : "visitors"} in the last 5 minutes
        </p>
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-hairline pt-3 text-[11.5px]">
          <div>
            <dt className="text-muted-foreground">Sessions</dt>
            <dd className="figure mt-0.5 text-[15px] font-semibold">
              {formatCompact(data.sessions)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Views per visit</dt>
            <dd className="figure mt-0.5 text-[15px] font-semibold">
              {perVisit ? perVisit.toFixed(1) : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </DashCard>
  );
}
