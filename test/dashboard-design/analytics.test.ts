import { describe, expect, test } from "bun:test";
import {
  countryInsight,
  countryShares,
  peakInsight,
  trafficBuckets,
} from "../../apps/web/src/features/dashboard/lib/analytics-insights";
import {
  drawableCountries,
  trafficViewBox,
} from "../../apps/web/src/features/dashboard/lib/world-map";
import {
  WORLD_COUNTRIES,
  WORLD_MAP_SIZE,
} from "../../apps/web/src/features/dashboard/lib/world-map.data";

const point = (label: string, pageviews: number, requests: number, errors = 0) => ({
  bandwidthBytes: 0,
  errors,
  label,
  latency: 0,
  pageviews,
  requests,
});

describe("world map", () => {
  test("every country box sits inside the map and is not inverted", () => {
    for (const [code, country] of Object.entries(WORLD_COUNTRIES)) {
      const [x0, y0, x1, y1] = country.box;
      expect(x0, code).toBeLessThanOrEqual(x1);
      expect(y0, code).toBeLessThanOrEqual(y1);
      expect(x0, code).toBeGreaterThanOrEqual(0);
      expect(x1, code).toBeLessThanOrEqual(WORLD_MAP_SIZE.width);
    }
  });

  test("covers the countries analytics reports most", () => {
    for (const code of ["NG", "US", "GB", "DE", "FR", "IN", "BR", "GH", "KE", "ZA"]) {
      expect(WORLD_COUNTRIES[code], code).toBeDefined();
    }
  });

  test("drops codes that are not countries, like Tor", () => {
    const drawable = drawableCountries([
      { code: "T1", value: 50 },
      { code: "NG", value: 10 },
      { code: "GB", value: 0 },
    ]);
    expect(drawable.map((item) => item.code)).toEqual(["NG"]);
  });

  test("frames the region with traffic, and the world when it is global", () => {
    expect(trafficViewBox([])).toEqual({ x: 0, y: 0, ...WORLD_MAP_SIZE });
    const nigeria = trafficViewBox([{ code: "NG", value: 100 }]);
    expect(nigeria.width).toBeLessThan(WORLD_MAP_SIZE.width);
    const global = trafficViewBox([
      { code: "US", value: 30 },
      { code: "JP", value: 30 },
      { code: "BR", value: 30 },
      { code: "ZA", value: 10 },
    ]);
    expect(global).toEqual({ x: 0, y: 0, ...WORLD_MAP_SIZE });
  });
});

describe("analytics readings", () => {
  test("country shares add up and lump the tail into Others", () => {
    const shares = countryShares([
      { label: "NG", requests: 50 },
      { label: "GB", requests: 20 },
      { label: "DE", requests: 10 },
      { label: "FR", requests: 10 },
      { label: "GH", requests: 10 },
    ]);
    expect(shares.map((share) => share.label)).toEqual([
      "Nigeria",
      "United Kingdom",
      "Germany",
      "Others",
    ]);
    expect(shares.reduce((sum, share) => sum + share.share, 0)).toBeCloseTo(100);
    expect(
      countryInsight([
        { label: "NG", requests: 50 },
        { label: "GB", requests: 50 },
      ]),
    ).toContain("Nigeria sends 50%");
    expect(countryInsight([])).toBeNull();
  });

  test("traffic uses page views when present, otherwise requests", () => {
    expect(trafficBuckets([point("a", 0, 10)]).valueLabel).toBe("Requests");
    const { buckets, valueLabel } = trafficBuckets([point("a", 4, 10, 1)]);
    expect(valueLabel).toBe("Page views");
    expect(buckets[0]).toEqual({ label: "a", value: 4, rate: 10 });
  });

  test("peak reading only claims a peak when there is one", () => {
    const spiky = trafficBuckets([point("01", 1, 1), point("02", 1, 1), point("03", 10, 10)]);
    expect(peakInsight(spiky.buckets, spiky.valueLabel)).toContain("peaked at 03");
    const flat = trafficBuckets([point("01", 5, 5), point("02", 5, 5)]);
    expect(peakInsight(flat.buckets, flat.valueLabel)).toContain("held steady");
    expect(peakInsight([], "Page views")).toBeNull();
  });
});

describe("deployment day groups", () => {
  test("labels today and yesterday, keeps order", async () => {
    const { groupByDay } = await import(
      "../../apps/web/src/features/dashboard/lib/deployment-groups"
    );
    const now = new Date(2026, 9, 27, 15);
    const groups = groupByDay(
      [
        { id: "a", createdAt: new Date(2026, 9, 27, 14).toISOString() },
        { id: "b", createdAt: new Date(2026, 9, 27, 9).toISOString() },
        { id: "c", createdAt: new Date(2026, 9, 26, 22).toISOString() },
        { id: "d", createdAt: new Date(2026, 9, 20, 8).toISOString() },
      ],
      now,
    );
    expect(groups.map((group) => group.label)).toEqual(["Today", "Yesterday", "Tue, Oct 20"]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["a", "b"]);
  });
});

describe("log histogram", () => {
  test("counts every event once, by level", async () => {
    const { bucketLogs, levelCounts } = await import(
      "../../apps/web/src/features/dashboard/lib/log-histogram"
    );
    const log = (id: string, minute: number, level: "info" | "warn" | "error") => ({
      id,
      deploymentId: "d",
      level,
      message: id,
      source: "build",
      timestamp: new Date(Date.UTC(2026, 9, 27, 12, minute)).toISOString(),
    });
    const logs = [
      log("1", 0, "info"),
      log("2", 5, "error"),
      log("3", 10, "warn"),
      log("4", 10, "error"),
    ];
    const buckets = bucketLogs(logs, 10);
    const total = buckets.reduce(
      (sum, bucket) => sum + bucket.counts.info + bucket.counts.warn + bucket.counts.error,
      0,
    );
    expect(total).toBe(4);
    expect(levelCounts(logs)).toEqual({ info: 1, warn: 1, error: 2 });
    expect(bucketLogs([], 10)).toEqual([]);
  });
});

describe("cron descriptions", () => {
  test("reads common schedules and refuses the rest", async () => {
    const { describeCron } = await import(
      "../../apps/web/src/features/dashboard/lib/workflow-steps"
    );
    expect(describeCron("0 6 * * *")).toBe("Every day at 06:00 UTC");
    expect(describeCron("*/15 * * * *")).toBe("Every 15 minutes");
    expect(describeCron("30 * * * *")).toBe("Every hour at :30");
    expect(describeCron("0 9 * * 1-5")).toBe("Weekdays at 09:00 UTC");
    expect(describeCron("0 9 * * 1")).toBe("Every Monday at 09:00 UTC");
    expect(describeCron("0 0 1 * *")).toBe("Monthly on day 1 at 00:00 UTC");
    expect(describeCron("0 0 1 1 *")).toBeNull();
    expect(describeCron("bad")).toBeNull();
  });
});
