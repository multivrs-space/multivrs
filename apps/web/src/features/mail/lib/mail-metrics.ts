import type { TrafficBucket } from "@/components/dashboard/charts/TrafficChart";
import type { MailActivityDay } from "@/features/mail/mail.types";

export type MailTotals = Omit<MailActivityDay, "day">;

/** SES reviews an account from these rates, so they're where trouble starts. */
export const SES_REVIEW = { bounce: 5, complaint: 0.1 } as const;

export function totalActivity(days: readonly MailActivityDay[]): MailTotals {
  const totals: MailTotals = {
    sent: 0,
    received: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
  };
  for (const day of days) {
    for (const key of Object.keys(totals) as (keyof MailTotals)[])
      totals[key] += day[key];
  }
  return totals;
}

/** `part` as a percent of `whole`, capped at 100; null when nothing was sent. */
export function rateOf(part: number, whole: number): number | null {
  return whole > 0 ? Math.min((part / whole) * 100, 100) : null;
}

/** Sent mail per day as bars, with the day's open rate as the line. */
export function activityBuckets(
  days: readonly MailActivityDay[],
): TrafficBucket[] {
  return days.map((day) => ({
    label: new Date(`${day.day}T00:00:00Z`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    value: day.sent,
    rate: rateOf(day.opened, day.delivered) ?? 0,
  }));
}

/** How many delivery outcomes the provider has reported back. */
export function reportsReceived(totals: MailTotals): number {
  return totals.delivered + totals.bounced + totals.complained;
}

/**
 * Delivered as a share of sent, or null until the provider has reported any
 * outcome: no reports means "not known yet", never "0% delivered".
 */
export function deliveryRate(totals: MailTotals): number | null {
  return reportsReceived(totals) > 0
    ? rateOf(totals.delivered, totals.sent)
    : null;
}

export type MailHealth = "quiet" | "awaiting" | "good" | "watch" | "risk";

/** Where bounces and complaints sit against what SES tolerates. */
export function mailHealth(totals: MailTotals): MailHealth {
  const bounce = rateOf(totals.bounced, totals.sent);
  const complaint = rateOf(totals.complained, totals.sent);
  if (bounce === null || complaint === null) return "quiet";
  if (reportsReceived(totals) === 0) return "awaiting";
  if (bounce >= SES_REVIEW.bounce || complaint >= SES_REVIEW.complaint)
    return "risk";
  if (bounce >= SES_REVIEW.bounce / 2 || complaint >= SES_REVIEW.complaint / 2)
    return "watch";
  return "good";
}

/** One plain sentence about the busiest day, or null when nothing went out. */
export function busiestDay(days: readonly MailActivityDay[]): string | null {
  const peak = days.reduce<MailActivityDay | null>(
    (best, day) => (day.sent > (best?.sent ?? 0) ? day : best),
    null,
  );
  if (!peak) return null;
  const date = new Date(`${peak.day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${date} was the busiest day, with ${peak.sent.toLocaleString("en-US")} sent.`;
}
