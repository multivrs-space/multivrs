"use client";

import { use } from "react";
import { ProgressRing } from "@/components/dashboard/charts/ProgressRing";
import { formatPercent } from "@/components/dashboard/lib/format";
import { LiveArrowUpRight } from "@/components/icons/animated";
import { TONE_RING } from "@/features/dashboard/components/usage/meter-tone";
import { HEADLINE_METERS } from "@/features/dashboard/components/usage/usage-groups";
import {
  formatAmount,
  meterShare,
  meterTone,
} from "@/features/dashboard/lib/usage-meters";
import { periodDays } from "@/features/dashboard/lib/usage-period";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { cn } from "@/lib/utils";

const PLAN = {
  hobby: "Hobby",
  pro: "Pro",
  enterprise: "Enterprise",
  unlimited: "Unlimited",
};

/**
 * The four meters most worth watching beside the project health, each as a
 * ring of what the plan includes. The whole card opens the usage view.
 */
export function ProjectsUsageSummary({
  usage,
  onOpen,
  className,
}: {
  usage: Promise<AccountUsage>;
  onOpen: () => void;
  className?: string;
}) {
  const data = use(usage);
  const days = periodDays(data.period, Date.parse(data.measuredAt));
  return (
    <button
      aria-label="Open usage"
      className={cn(
        "surface-card group flex flex-col rounded-card p-4 text-left outline-none transition-colors hover:bg-foreground/[0.015] focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      data-icon-trigger
      onClick={onOpen}
      type="button"
    >
      <span className="flex w-full items-center gap-2 text-[12.5px] text-muted-foreground">
        <span className="font-medium text-foreground">Usage</span>
        <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[11px]">
          {PLAN[data.plan]}
        </span>
        <span className="truncate">
          {days.left
            ? `${days.left + 1} days left in period`
            : "Last day of period"}
        </span>
        <LiveArrowUpRight
          className="ml-auto size-3.5 shrink-0 transition-colors group-hover:text-foreground"
          strokeWidth={2}
        />
      </span>
      <span className="mt-3 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {HEADLINE_METERS.map((row) => {
          const meter = data.meters[row.key];
          const share = meterShare(meter);
          return (
            <span className="flex min-w-0 items-center gap-2.5" key={row.key}>
              <ProgressRing
                className="size-10"
                tone={share === null ? "muted" : TONE_RING[meterTone(share)]}
                value={share ?? 0}
              >
                <span className="figure text-[9.5px] font-semibold text-foreground">
                  {share === null
                    ? "—"
                    : formatPercent(Math.min(share * 100, 999), 0)}
                </span>
              </ProgressRing>
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-muted-foreground">
                  {row.label}
                </span>
                <span className="figure block truncate text-[13px] font-semibold text-foreground">
                  {formatAmount(meter?.used ?? 0, row.format)}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </button>
  );
}
