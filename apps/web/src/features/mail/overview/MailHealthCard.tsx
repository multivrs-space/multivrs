"use client";

import { SegmentedGauge } from "@/components/dashboard/charts/SegmentedGauge";
import {
  DashCard,
  DashCardHeader,
  DashCardInsight,
} from "@/components/dashboard/DashCard";
import { formatPercent } from "@/components/dashboard/lib/format";
import { LiveShieldCheck, LiveSparkles } from "@/components/icons/animated";
import {
  deliveryRate,
  type MailHealth,
  mailHealth,
  rateOf,
  SES_REVIEW,
  totalActivity,
} from "@/features/mail/lib/mail-metrics";
import { useMailActivity } from "@/features/mail/mail-context";
import { cn } from "@/lib/utils";

const VERDICT: Record<MailHealth, { caption: string; note: string }> = {
  quiet: {
    caption: "No mail",
    note: "Send something and delivery health shows up here within minutes.",
  },
  awaiting: {
    caption: "No reports yet",
    note: "Mail went out, but no delivery reports have come back yet. They usually arrive within minutes of sending.",
  },
  good: {
    caption: "Healthy",
    note: "Bounces and complaints are well under the levels that put sending at risk.",
  },
  watch: {
    caption: "Watch",
    note: "Bounces or complaints are halfway to the level where sending is paused for review. Clean your lists.",
  },
  risk: {
    caption: "At risk",
    note: "Sending is paused for review at these rates. Pause campaigns and remove bad addresses.",
  },
};

/** Delivery rate as a gauge, with bounces and complaints against SES limits. */
export function MailHealthCard({ className }: { className?: string }) {
  const totals = totalActivity(useMailActivity());
  const health = mailHealth(totals);
  const delivery = deliveryRate(totals);
  const rows = [
    {
      label: "Bounces",
      value: rateOf(totals.bounced, totals.sent),
      limit: SES_REVIEW.bounce,
    },
    {
      label: "Complaints",
      value: rateOf(totals.complained, totals.sent),
      limit: SES_REVIEW.complaint,
    },
  ];
  return (
    <DashCard aria-label="Deliverability" className={className}>
      <DashCardHeader
        description="Last 30 days"
        icon={LiveShieldCheck}
        title="Deliverability"
      />
      <SegmentedGauge
        caption={VERDICT[health].caption}
        format={(value) => `${(Math.floor(value * 10) / 10).toFixed(1)}%`}
        className="mt-4 max-w-[260px]"
        label="Delivered"
        value={delivery}
      />
      <dl className="space-y-2 px-5 pb-4 pt-2">
        {rows.map((row) => (
          <div
            className="flex items-center justify-between gap-3 text-[12.5px]"
            key={row.label}
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="flex items-center gap-2">
              <span
                className={cn(
                  "figure font-medium",
                  row.value !== null && row.value >= row.limit
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground",
                )}
              >
                {row.value === null ? "—" : formatPercent(row.value, 2)}
              </span>
              <span className="font-geist-mono text-[10.5px] text-muted-foreground">
                / {formatPercent(row.limit, row.limit < 1 ? 1 : 0)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <DashCardInsight icon={LiveSparkles} label={VERDICT[health].caption}>
        {VERDICT[health].note}
      </DashCardInsight>
    </DashCard>
  );
}
