"use client";

import { TrafficChart } from "@/components/dashboard/charts/TrafficChart";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { LiveChartColumn, LiveSparkles } from "@/components/icons/animated";
import { activityBuckets, busiestDay } from "@/features/mail/lib/mail-metrics";
import type { MailActivityDay } from "@/features/mail/mail.types";

/** Mail sent per day as bars, with that day's open rate traced over them. */
export function MailVolumeChartCard({
  days,
  className,
}: {
  days: MailActivityDay[];
  className?: string;
}) {
  const insight = busiestDay(days);
  return (
    <DashCard aria-label="Sent per day" className={className}>
      <DashCardHeader
        action={
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[3px] bg-foreground/25" />
              Sent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full bg-foreground/70" />
              Open rate
            </span>
          </div>
        }
        icon={LiveChartColumn}
        title="Sent per day"
      />
      <TrafficChart
        buckets={activityBuckets(days)}
        className="h-64 px-5 pt-6"
        rateLabel="Open rate"
        valueLabel="Sent"
      />
      {insight ? (
        <DashCardInsight icon={LiveSparkles} label="Reading">
          {insight}
        </DashCardInsight>
      ) : null}
    </DashCard>
  );
}
