import { describe, expect, test } from "bun:test";
import {
  requestStats,
  statusClass,
  statusLevel,
} from "../../apps/web/src/features/dashboard/lib/request-log-stats";
import {
  cumulative,
  formatAmount,
  meterShare,
  metersNeedingAttention,
  meterTone,
  projectedTotal,
} from "../../apps/web/src/features/dashboard/lib/usage-meters";
import {
  buildMeters,
  foldDaily,
  periodDays,
  periodLabels,
} from "../../apps/web/src/features/dashboard/lib/usage-period";

const PERIOD = {
  start: "2026-10-01T00:00:00.000Z",
  end: "2026-11-01T00:00:00.000Z",
};
const NOW = Date.UTC(2026, 9, 27, 12);
const GiB = 1024 ** 3;

describe("billing period", () => {
  test("counts whole days, the current one included", () => {
    expect(periodDays(PERIOD, NOW)).toEqual({ total: 31, elapsed: 27, left: 4 });
    expect(periodLabels(PERIOD)).toEqual({ start: "Oct 1", last: "Oct 31", reset: "Nov 1" });
  });

  test("folds daily amounts into one slot per elapsed day", () => {
    const daily = foldDaily(
      [
        { metric: "isr_reads", day: "2026-10-01", quantity: 3 },
        { metric: "isr_reads", day: "2026-10-01", quantity: 2 },
        { metric: "isr_reads", day: "2026-10-27", quantity: 7 },
        { metric: "isr_reads", day: "2026-09-30", quantity: 99 },
      ],
      PERIOD,
      NOW,
    );
    expect(daily.isr_reads).toHaveLength(27);
    expect(daily.isr_reads?.[0]).toBe(5);
    expect(daily.isr_reads?.[26]).toBe(7);
  });

  test("meters total their days; held amounts and unbilled keys stay as they are", () => {
    const meters = buildMeters({
      daily: { isr_reads: [1, 2, 3] },
      held: { blob_storage_size: 2 * GiB, bulk_redirects: 4 },
      allowances: { isr_reads: 100, blob_storage_size: 5 * GiB, edge_requests: null },
    });
    expect(meters.isr_reads).toEqual({ used: 6, daily: [1, 2, 3], included: 100 });
    expect(meters.blob_storage_size).toEqual({ used: 2 * GiB, daily: [], included: 5 * GiB });
    expect(meters.bulk_redirects).toEqual({ used: 4, daily: [] });
    expect(meters.edge_requests).toEqual({ used: 0, daily: [], included: null });
  });
});

describe("usage meters", () => {
  test("share and tone follow the allowance", () => {
    expect(meterShare({ used: 50, included: 100, daily: [] })).toBe(0.5);
    expect(meterShare({ used: 50, included: null, daily: [] })).toBeNull();
    expect(meterShare({ used: 50, daily: [] })).toBeNull();
    expect(meterTone(0.5)).toBe("ok");
    expect(meterTone(0.8)).toBe("near");
    expect(meterTone(1.2)).toBe("over");
    expect(meterTone(null)).toBe("ok");
  });

  test("amounts read in their own units without trailing zeros", () => {
    expect(formatAmount(5 * GiB, "bytes")).toBe("5 GB");
    expect(formatAmount(38.4 * GiB, "bytes")).toBe("38.4 GB");
    expect(formatAmount(431 * 60_000, "minutes")).toBe("431 min");
    expect(formatAmount(90 * 60_000, "duration")).toBe("90 min");
    expect(formatAmount(3 * 3_600_000, "duration")).toBe("3 h");
    expect(formatAmount(1_284_000, "count")).toBe("1.3M");
  });

  test("pace projects the daily average to the period's end", () => {
    const meter = { used: 270, included: 300, daily: [10, 20] };
    const halfway = Date.parse(PERIOD.start) + 15.5 * 86_400_000;
    expect(projectedTotal(meter, PERIOD, halfway)).toBeCloseTo(540, 5);
    expect(projectedTotal(meter, PERIOD, Date.parse(PERIOD.start) + 3_600_000)).toBeNull();
    expect(projectedTotal({ used: 1, daily: [] }, PERIOD, halfway)).toBeNull();
    expect(cumulative([1, 2, 3])).toEqual([1, 3, 6]);
  });

  test("attention lists billed meters at 75% or more, fullest first", () => {
    expect(
      metersNeedingAttention({
        a: { used: 80, included: 100, daily: [] },
        b: { used: 130, included: 100, daily: [] },
        c: { used: 10, included: 100, daily: [] },
        d: { used: 999, included: null, daily: [] },
      }).map((entry) => entry.key),
    ).toEqual(["b", "a"]);
  });
});

describe("request logs", () => {
  const row = (status: number, sampleInterval = 1, durationMs = 10) => ({
    id: `${status}`,
    timestamp: "2026-10-27T12:00:00Z",
    projectId: "p",
    deploymentId: "d",
    host: "acme.app",
    path: "/",
    method: "GET",
    status,
    durationMs,
    bytes: 0,
    country: "NG",
    colo: "LOS",
    sampleInterval,
  });

  test("status codes sort into classes and log levels", () => {
    expect([200, 304, 404, 503].map(statusClass)).toEqual(["ok", "ok", "client", "server"]);
    expect([200, 404, 503].map(statusLevel)).toEqual(["info", "warn", "error"]);
  });

  test("totals weigh sampled rows by the requests they stand for", () => {
    const stats = requestStats([row(200, 3, 10), row(500, 1, 30), row(404, 1, 20)]);
    expect(stats.total).toBe(5);
    expect(stats.serverRate).toBe(20);
    expect(stats.clientRate).toBe(20);
    expect(stats.p50).toBe(20);
    expect(stats.sampled).toBe(true);
    expect(requestStats([]).serverRate).toBeNull();
  });
});
