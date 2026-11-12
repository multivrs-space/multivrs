import type { ShareColumn } from "@/components/dashboard/charts/ShareColumns";
import type { TrafficBucket } from "@/components/dashboard/charts/TrafficChart";
import { shareOf } from "@/components/dashboard/lib/format";
import { countryName } from "@/features/dashboard/lib/world-map";
import type {
  AnalyticsBreakdownItem,
  AnalyticsPoint,
} from "@/features/dashboard/types/analytics.types";

/**
 * Plain-language readings of the analytics data. Every sentence is derived
 * from the numbers on screen; nothing is predicted or invented.
 */

/** Top countries plus an "Others" remainder, as shares of all requests. */
export function countryShares(
  countries: readonly AnalyticsBreakdownItem[],
  leaders = 3,
): ShareColumn[] {
  const total = countries.reduce((sum, item) => sum + item.requests, 0);
  if (total === 0) return [];
  const top = countries.slice(0, leaders).map((item) => ({
    label: countryName(item.label),
    share: shareOf(item.requests, total),
  }));
  const rest = countries
    .slice(leaders)
    .reduce((sum, item) => sum + item.requests, 0);
  return rest > 0
    ? [...top, { label: "Others", share: shareOf(rest, total), rest: true }]
    : top;
}

export function countryInsight(
  countries: readonly AnalyticsBreakdownItem[],
): string | null {
  const [leader] = countries;
  const total = countries.reduce((sum, item) => sum + item.requests, 0);
  if (!leader || total === 0) return null;
  const share = Math.round(shareOf(leader.requests, total));
  const reach =
    countries.length === 1 ? "one country" : `${countries.length} countries`;
  return `${countryName(leader.label)} sends ${share}% of requests; traffic reached ${reach} in this period.`;
}

/** Bars use page views when the site reports them, otherwise edge requests. */
export function trafficBuckets(points: readonly AnalyticsPoint[]): {
  buckets: TrafficBucket[];
  valueLabel: string;
} {
  const hasPageviews = points.some((point) => point.pageviews > 0);
  return {
    valueLabel: hasPageviews ? "Page views" : "Requests",
    buckets: points.map((point) => ({
      label: point.label,
      value: hasPageviews ? point.pageviews : point.requests,
      rate: point.requests ? (point.errors / point.requests) * 100 : 0,
    })),
  };
}

export function peakInsight(
  buckets: readonly TrafficBucket[],
  valueLabel: string,
): string | null {
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  if (buckets.length < 2 || total === 0) return null;
  const peak = buckets.reduce((best, bucket) =>
    bucket.value > best.value ? bucket : best,
  );
  const ratio = peak.value / (total / buckets.length);
  return ratio >= 1.15
    ? `${valueLabel} peaked at ${peak.label}, ${ratio.toFixed(1)}× the period average.`
    : `${valueLabel} held steady across the period, peaking at ${peak.label}.`;
}

/** Per-bucket error rate as a sparkline series. */
export function errorRateSeries(points: readonly AnalyticsPoint[]): number[] {
  return points.map((point) =>
    point.requests ? (point.errors / point.requests) * 100 : 0,
  );
}
