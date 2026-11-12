"use client";

import { useState } from "react";
import { BurnChart } from "@/components/dashboard/charts/BurnChart";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatPercent } from "@/components/dashboard/lib/format";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveChartColumn } from "@/components/icons/animated";
import { TONE_TEXT } from "@/features/dashboard/components/usage/meter-tone";
import { HEADLINE_METERS } from "@/features/dashboard/components/usage/usage-groups";
import {
  cumulative,
  formatAmount,
  meterShare,
  meterTone,
  projectedTotal,
} from "@/features/dashboard/lib/usage-meters";
import {
  periodDays,
  periodLabels,
} from "@/features/dashboard/lib/usage-period";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { cn } from "@/lib/utils";

/**
 * The period so far for one headline meter: a running total climbing toward
 * the plan's line, and where today's pace would land by the reset.
 */
export function UsageBurnCard({
  usage,
  className,
}: {
  usage: AccountUsage;
  className?: string;
}) {
  const [key, setKey] = useState(HEADLINE_METERS[0]?.key ?? "edge_requests");
  const row =
    HEADLINE_METERS.find((item) => item.key === key) ?? HEADLINE_METERS[0];
  if (!row) return null;
  const now = Date.parse(usage.measuredAt);
  const meter = usage.meters[row.key] ?? { used: 0, daily: [] };
  const days = periodDays(usage.period, now);
  const dates = periodLabels(usage.period);
  const daily = meter.daily.length
    ? meter.daily
    : Array.from({ length: days.elapsed }, () => 0);
  const share = meterShare(meter);
  const tone = meterTone(share);
  const projected = projectedTotal(meter, usage.period, now);
  const format = (value: number) => formatAmount(value, row.format);
  const included = meter.included;
  const picker = (
    <SegmentedControl
      aria-label="Meter"
      className="w-max"
      onChange={setKey}
      options={HEADLINE_METERS.map((item) => ({
        value: item.key,
        label: item.label,
      }))}
      value={row.key}
    />
  );

  return (
    <DashCard aria-label="This period" className={className}>
      <DashCardHeader
        action={<div className="hidden lg:block">{picker}</div>}
        description="Running total against what your plan includes"
        icon={LiveChartColumn}
        title="This period"
      />
      <div className="overflow-x-auto px-5 pt-4 [scrollbar-width:none] lg:hidden">
        {picker}
      </div>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1 px-5 pt-5">
        <p className="figure text-[40px] font-semibold leading-none tracking-[-0.03em]">
          {format(meter.used)}
        </p>
        <p className="pb-1 text-[13px] text-muted-foreground">
          {included === undefined || included === null
            ? "No cap on your plan"
            : `of ${format(included)} included`}
        </p>
        {share === null ? null : (
          <span
            className={cn(
              "figure mb-1 ml-auto rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[11.5px] font-medium",
              TONE_TEXT[tone],
            )}
          >
            {formatPercent(Math.min(share * 100, 999), 0)} used
          </span>
        )}
      </div>
      <p className="px-5 pt-1.5 text-[12.5px] text-muted-foreground">
        {projected === null
          ? row.description
          : `At this pace, about ${format(projected)} by ${dates.last}${
              included && projected > included ? ", past what's included" : ""
            }.`}
      </p>
      <BurnChart
        className="mx-5 mt-6 h-48 sm:h-56"
        days={days.total}
        format={format}
        included={included}
        label={`${row.label}: running total this period`}
        projected={projected}
        totals={cumulative(daily)}
      />
      <div className="flex justify-between px-5 pb-5 pt-2 font-geist-mono text-[10.5px] text-muted-foreground">
        <span>{dates.start}</span>
        <span>{dates.last}</span>
      </div>
    </DashCard>
  );
}
