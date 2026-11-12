import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { formatPercent } from "@/components/dashboard/lib/format";
import { MeterBar } from "@/features/dashboard/components/usage/MeterBar";
import { TONE_TEXT } from "@/features/dashboard/components/usage/meter-tone";
import type { MeterRow } from "@/features/dashboard/components/usage/usage-groups";
import {
  formatAmount,
  meterShare,
  meterTone,
} from "@/features/dashboard/lib/usage-meters";
import type { UsageMeter } from "@/features/dashboard/types/usage.types";
import { cn } from "@/lib/utils";

/**
 * One meter: what it is, its daily shape, used against included, and a bar
 * once the plan sets a cap. Counts of things held say "Not billed".
 */
export function UsageMeterRow({
  row,
  meter,
}: {
  row: MeterRow;
  meter: UsageMeter | undefined;
}) {
  const share = meterShare(meter);
  const tone = meterTone(share);
  const included = meter?.included;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025]">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">
          {row.label}
        </p>
        <p className="truncate text-[11.5px] text-muted-foreground">
          {row.description}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {meter && meter.daily.length > 1 ? (
          <Sparkline
            className="hidden h-7 w-20 sm:block"
            label={`${row.label} per day this period`}
            tone={tone === "ok" ? "muted" : "primary"}
            values={meter.daily}
          />
        ) : null}
        <p className="min-w-[72px] text-right">
          <span className="figure block text-[15px] font-semibold leading-tight text-foreground">
            {formatAmount(meter?.used ?? 0, row.format)}
          </span>
          <span className="block font-geist-mono text-[10.5px] text-muted-foreground">
            {included === undefined
              ? "Not billed"
              : included === null
                ? "No cap"
                : `of ${formatAmount(included, row.format)}`}
          </span>
        </p>
      </div>
      {share === null ? null : (
        <div className="col-span-2 flex items-center gap-3">
          <MeterBar className="flex-1" share={share} tone={tone} />
          <span
            className={cn(
              "figure w-10 text-right text-[11px] font-medium",
              TONE_TEXT[tone],
            )}
          >
            {formatPercent(Math.min(share * 100, 999), 0)}
          </span>
        </div>
      )}
    </div>
  );
}
