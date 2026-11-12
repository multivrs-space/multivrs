import type {
  AnalyticsAudience,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";

/* Synthetic traffic for tuning Web Analytics in the lab only. Product pages
   never render made-up numbers. */

const COUNTRIES: [string, number][] = [
  ["NG", 8_420],
  ["GB", 3_910],
  ["US", 3_260],
  ["DE", 2_140],
  ["GH", 1_480],
  ["FR", 1_120],
  ["KE", 860],
  ["NL", 640],
  ["ZA", 590],
  ["CA", 410],
  ["IN", 380],
  ["BR", 220],
];
const rows = (items: [string, number][]) =>
  items.map(([label, requests]) => ({ label, requests }));

export const LAB_ANALYTICS: PlatformAnalytics = {
  averageLatency: 84,
  bandwidthBytes: 48_300_000_000,
  bounceRate: 38,
  countries: rows(COUNTRIES),
  devices: rows([
    ["desktop", 14_200],
    ["mobile", 9_800],
    ["tablet", 1_100],
  ]),
  errorRate: 0.42,
  pageviews: 74_200,
  paths: rows([
    ["/", 21_400],
    ["/pricing", 9_120],
    ["/docs/getting-started", 6_380],
    ["/blog/edge-caching", 4_210],
    ["/changelog", 2_960],
  ]),
  range: "7d",
  referrers: rows([
    ["google.com", 9_400],
    ["x.com", 3_100],
    ["github.com", 2_480],
    ["news.ycombinator.com", 1_210],
  ]),
  requests: 1_284_000,
  sessions: 31_600,
  series: Array.from({ length: 7 }, (_, day) => {
    const pageviews =
      8_400 + Math.round(2_600 * Math.sin(day / 1.3)) + day * 380;
    return {
      bandwidthBytes: pageviews * 640_000,
      errors: Math.round(pageviews * 0.06),
      label: `10-${String(21 + day).padStart(2, "0")}`,
      latency: 70 + day * 3,
      pageviews,
      requests: pageviews * 17,
    };
  }),
  sources: [],
  state: "ready",
  visitors: 25_100,
  previous: {
    bounceRate: 41,
    errorRate: 0.51,
    pageviews: 68_900,
    requests: 1_190_000,
    sessions: 29_300,
    visitors: 23_600,
  },
};

export const LAB_AUDIENCE: AnalyticsAudience = {
  live: 37,
  countries: rows(
    COUNTRIES.map(([code, value]) => [code, Math.round(value / 3)]),
  ),
  cities: rows([
    ["Lagos, NG", 1_920],
    ["London, GB", 980],
    ["Accra, GH", 410],
  ]),
  browsers: rows([
    ["Chrome", 15_200],
    ["Safari", 6_900],
    ["Firefox", 1_400],
    ["Edge", 1_100],
  ]),
  events: rows([
    ["Signed up", 1_240],
    ["Clicked pricing CTA", 3_810],
    ["Started checkout", 690],
    ["Copied install command", 2_150],
  ]).sort((a, b) => b.requests - a.requests),
};
