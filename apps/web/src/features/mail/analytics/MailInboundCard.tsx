"use client";

import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import { LiveInbox } from "@/components/icons/animated";
import type { MailActivityDay } from "@/features/mail/mail.types";

/** Mail that arrived in your mailboxes, day by day. */
export function MailInboundCard({
  days,
  className,
}: {
  days: MailActivityDay[];
  className?: string;
}) {
  const received = days.reduce((sum, day) => sum + day.received, 0);
  return (
    <DashCard aria-label="Received" className={className}>
      <DashCardHeader
        description="Inbound to every mailbox"
        icon={LiveInbox}
        title="Received"
      />
      <p className="figure px-5 pt-4 text-[30px] font-semibold leading-none">
        {formatCompact(received)}
      </p>
      <Sparkline
        className="mt-auto h-24 w-full pt-3"
        label="Mail received per day"
        tone="muted"
        values={days.map((day) => day.received)}
      />
    </DashCard>
  );
}
