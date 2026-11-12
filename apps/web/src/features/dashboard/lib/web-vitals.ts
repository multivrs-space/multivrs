import type { WebVitalMetric } from "@/features/dashboard/types/analytics.types";

export type VitalName = WebVitalMetric["name"];
export type VitalRating = "good" | "needs-improvement" | "poor";

/**
 * Google's published Core Web Vitals thresholds (p75): at or under the first
 * value is good, at or under the second needs improvement, above is poor.
 */
export const VITAL_THRESHOLDS: Record<VitalName, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
};

export function vitalRating(name: VitalName, value: number): VitalRating {
  const [good, ok] = VITAL_THRESHOLDS[name];
  if (value <= good) return "good";
  if (value <= ok) return "needs-improvement";
  return "poor";
}

export const RATING_LABELS: Record<VitalRating, string> = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
};

export function formatVital(
  name: VitalName,
  value: number | undefined,
): string {
  if (value === undefined) return "—";
  if (name === "CLS") return value.toFixed(3);
  return value >= 1000
    ? `${(value / 1000).toFixed(2)} s`
    : `${Math.round(value)} ms`;
}

/**
 * Experience score: the share of real measurements rated good across the
 * Core Web Vitals we have (LCP, INP, CLS), weighted by sample count. TTFB is
 * a diagnostic, not part of the score. Null when there is nothing measured.
 */
export function experienceScore(
  metrics: readonly WebVitalMetric[],
): number | null {
  const core = metrics.filter(
    (metric) => metric.name !== "TTFB" && metric.samples > 0,
  );
  const samples = core.reduce((sum, metric) => sum + metric.samples, 0);
  if (samples === 0) return null;
  const good = core.reduce(
    (sum, metric) => sum + (metric.goodRate / 100) * metric.samples,
    0,
  );
  return Math.round((good / samples) * 100);
}

export function scoreVerdict(score: number): string {
  if (score >= 90) return "Great";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}
