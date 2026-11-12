"use client";

import { Suspense } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { Metric } from "@/components/dashboard/Metric";
import {
  LiveChartColumn,
  LiveMailCheck,
  LivePlus,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { MailAnalyticsSkeleton } from "@/features/mail/analytics/MailAnalyticsSkeleton";
import { MailFunnelCard } from "@/features/mail/analytics/MailFunnelCard";
import { MailInboundCard } from "@/features/mail/analytics/MailInboundCard";
import { MailVolumeChartCard } from "@/features/mail/analytics/MailVolumeChartCard";
import {
  deliveryRate,
  rateOf,
  totalActivity,
} from "@/features/mail/lib/mail-metrics";
import { useMailActivity, useMailContext } from "@/features/mail/mail-context";
import { MailHealthCard } from "@/features/mail/overview/MailHealthCard";

/** Thirty days of sending: volume, the funnel, deliverability, inbound. */
export function MailAnalyticsPage() {
  return (
    <PageBody>
      <DashboardPageHeader
        description="The last 30 days by UTC day. Rates come from provider events, so opens and clicks count every one reported."
        eyebrow="Emails · Communicate"
        title="Mail analytics"
      />
      <Suspense fallback={<MailAnalyticsSkeleton />}>
        <MailAnalyticsBody />
      </Suspense>
    </PageBody>
  );
}

function MailAnalyticsBody() {
  const days = useMailActivity();
  const { openCompose } = useMailContext();
  const totals = totalActivity(days);
  if (!totals.sent && !totals.received) {
    return (
      <DashCard>
        <EmptyState
          actions={
            <Button
              data-icon-trigger
              onClick={openCompose}
              size="sm"
              variant="hero"
            >
              <LivePlus strokeWidth={2} />
              Compose
            </Button>
          }
          description="Nothing was sent or received in the last 30 days. Send a message and the numbers start here."
          glyph={LiveChartColumn}
          title="No mail yet"
        />
      </DashCard>
    );
  }
  const rate = (part: number, whole: number) => {
    const value = rateOf(part, whole);
    return value === null ? "—" : formatPercent(value, 1);
  };
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <DashCard aria-label="Totals" className="lg:col-span-12">
        <DashCardHeader
          description="Opens and clicks are a share of delivered mail"
          icon={LiveMailCheck}
          title="Totals"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-5 pt-6 md:grid-cols-4">
          <Metric label="Sent" value={formatCompact(totals.sent)} />
          <Metric
            label="Delivered"
            value={
              deliveryRate(totals) === null
                ? "—"
                : rate(totals.delivered, totals.sent)
            }
          />
          <Metric
            label="Opened"
            value={rate(totals.opened, totals.delivered)}
          />
          <Metric
            label="Clicked"
            value={rate(totals.clicked, totals.delivered)}
          />
        </div>
      </DashCard>
      <MailVolumeChartCard className="lg:col-span-8" days={days} />
      <MailFunnelCard className="lg:col-span-4" totals={totals} />
      <MailHealthCard className="lg:col-span-6" />
      <MailInboundCard className="lg:col-span-6" days={days} />
    </div>
  );
}
