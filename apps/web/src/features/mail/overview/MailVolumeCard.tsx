"use client";

import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { Metric } from "@/components/dashboard/Metric";
import { LiveMailCheck } from "@/components/icons/animated";
import {
  deliveryRate,
  rateOf,
  totalActivity,
} from "@/features/mail/lib/mail-metrics";
import { useMailActivity } from "@/features/mail/mail-context";

/** The month at a glance: what went out and came in, and how it landed. */
export function MailVolumeCard({ className }: { className?: string }) {
  const days = useMailActivity();
  const totals = totalActivity(days);
  const delivery = deliveryRate(totals);
  const opens = rateOf(totals.opened, totals.delivered);
  return (
    <DashCard aria-label="Last 30 days" className={className}>
      <DashCardHeader
        description="Every mailbox you can see, by UTC day"
        icon={LiveMailCheck}
        title="Last 30 days"
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-5 pt-6 sm:grid-cols-4">
        <Metric label="Sent" size="md" value={formatCompact(totals.sent)} />
        <Metric
          label="Received"
          size="md"
          value={formatCompact(totals.received)}
        />
        <Metric
          label="Delivered"
          size="md"
          value={delivery === null ? "—" : formatPercent(delivery, 1)}
        />
        <Metric
          label="Opened"
          size="md"
          value={opens === null ? "—" : formatPercent(opens, 1)}
        />
      </div>
      <Sparkline
        className="mt-auto h-20 w-full"
        label="Mail sent per day"
        values={days.map((day) => day.sent)}
      />
    </DashCard>
  );
}
