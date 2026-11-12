"use client";

import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { LiveFileUp } from "@/components/icons/animated";
import {
  type MailTotals,
  rateOf,
  reportsReceived,
} from "@/features/mail/lib/mail-metrics";

const STEPS = [
  { key: "sent", label: "Sent", fill: "bg-chart-1" },
  { key: "delivered", label: "Delivered", fill: "bg-chart-2" },
  { key: "opened", label: "Opened", fill: "bg-chart-3" },
  { key: "clicked", label: "Clicked", fill: "bg-chart-4" },
] as const;

/** How much of what went out arrived, got opened, then got clicked. */
export function MailFunnelCard({
  totals,
  className,
}: {
  totals: MailTotals;
  className?: string;
}) {
  return (
    <DashCard aria-label="Funnel" className={className}>
      <DashCardHeader
        description="Share of mail sent"
        icon={LiveFileUp}
        title="Funnel"
      />
      <ol className="flex flex-1 flex-col justify-center gap-4 p-5">
        {STEPS.map((step) => {
          const share = rateOf(totals[step.key], totals.sent) ?? 0;
          return (
            <li key={step.key}>
              <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="figure font-medium text-foreground">
                  {formatCompact(totals[step.key])}
                  <span className="ml-2 font-geist-mono text-[11px] font-normal text-muted-foreground">
                    {step.key !== "sent" && reportsReceived(totals) === 0
                      ? "not reported"
                      : formatPercent(share, 1)}
                  </span>
                </span>
              </div>
              <div className="surface-inset mt-1.5 h-2.5 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${step.fill} transition-[width] duration-700 ease-out-expo`}
                  style={{
                    width: `${Math.max(share, totals[step.key] ? 1.5 : 0)}%`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </DashCard>
  );
}
