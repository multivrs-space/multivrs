import { describe, expect, test } from "bun:test";
import {
  buildNavHref,
  DASHBOARD_NAV_ITEMS,
} from "../../apps/web/src/features/dashboard/constants/navigation";
import { getSectionMeta } from "../../apps/web/src/features/dashboard/constants/sections";
import {
  dayparts,
  heatBlocks,
  heatLevel,
  peakSlot,
} from "../../apps/web/src/features/dashboard/lib/overview-heat";
import {
  dailyRequests,
  deploySuccessRate,
  headline,
  weekOverWeek,
} from "../../apps/web/src/features/dashboard/lib/overview-insights";

const NOW = Date.UTC(2026, 9, 27, 15);
const day = (offset: number) => new Date(NOW - offset * 86_400_000).toISOString().slice(0, 10);
const deploys = (ready: number, failed: number) => ({
  thisWeek: 0,
  lastWeek: 0,
  ready,
  failed,
  building: 0,
});

function heatWith(entries: [day: number, hour: number, value: number][]) {
  const cells = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  let total = 0;
  for (const [d, h, v] of entries) {
    const row = cells[d];
    if (row) row[h] = v;
    total += v;
  }
  return { cells, total };
}

describe("overview navigation", () => {
  test("Overview is the scope root and Projects always lists the workspace", () => {
    expect(DASHBOARD_NAV_ITEMS[0]).toMatchObject({ name: "Overview", slug: "" });
    expect(buildNavHref("acme", "~", "")).toBe("/acme");
    expect(buildNavHref("acme", "shop", "")).toBe("/acme/shop");
    expect(buildNavHref("acme", "shop", "projects")).toBe("/acme/~/projects");
    expect(getSectionMeta("projects")?.title).toBe("Projects");
  });

  test("Logs sits under Observe; build output stays with Deployments", () => {
    const group = (slug: string) => DASHBOARD_NAV_ITEMS.find((item) => item.slug === slug)?.group;
    expect(group("logs")).toBe("observe");
    expect(group("deployments")).toBe("build");
  });
});

describe("overview insights", () => {
  test("week over week sums the last 7 days against the 7 before", () => {
    const series = [
      { day: day(1), requests: 300 },
      { day: day(6), requests: 100 },
      { day: day(8), requests: 200 },
      { day: day(20), requests: 999 },
    ];
    expect(weekOverWeek(series, NOW)).toEqual({ current: 400, previous: 200, change: 100 });
    expect(weekOverWeek([{ day: day(1), requests: 5 }], NOW).change).toBeNull();
  });

  test("daily requests fill quiet days with zero, oldest first", () => {
    const days = dailyRequests([{ day: day(0), requests: 7 }], 3, NOW);
    expect(days.map((point) => point.value)).toEqual([0, 0, 7]);
    expect(days[2]?.label).toBe("Oct 27");
  });

  test("success rate ignores builds still running", () => {
    expect(deploySuccessRate(deploys(9, 1))).toBe(90);
    expect(deploySuccessRate(deploys(0, 0))).toBeNull();
  });

  test("heat folds hours into three-hour blocks, latest block first", () => {
    const heat = heatWith([
      [0, 1, 4],
      [0, 2, 6],
      [6, 23, 3],
    ]);
    const blocks = heatBlocks(heat);
    expect(blocks[0]?.label).toBe("21:00");
    expect(blocks[0]?.values[6]).toBe(3);
    expect(blocks[7]?.values[0]).toBe(10);
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(10, 10)).toBe(4);
    expect(heatLevel(3, 10)).toBe(2);
  });

  test("day parts add to 100 and the peak is named", () => {
    const heat = heatWith([
      [1, 9, 60],
      [1, 20, 40],
    ]);
    expect(dayparts(heat).map((part) => Math.round(part.share))).toEqual([0, 60, 0, 40]);
    expect(peakSlot(heat)).toEqual({ day: "Tuesday", hour: 9 });
    expect(peakSlot(heatWith([]))).toBeNull();
  });

  test("the headline puts failures first, then traffic, then deploys", () => {
    const quiet = { change: null, current: 0 };
    expect(
      headline({ failing: 2, traffic: quiet, deploys: deploys(1, 2), peak: null }).figure,
    ).toBe("2");
    expect(
      headline({ failing: 2, traffic: quiet, deploys: deploys(1, 2), peak: null }),
    ).toMatchObject({
      figure: "2",
      tail: "projects failed their latest deploy. The build logs show why.",
      next: "failed-deploys",
    });
    expect(headline({ failing: 1, traffic: quiet, deploys: deploys(0, 1), peak: null }).tail).toBe(
      "project failed its latest deploy. The build log shows why.",
    );
    const up = headline({
      failing: 0,
      traffic: { change: 18.4, current: 10 },
      deploys: deploys(1, 0),
      peak: { day: "Tuesday", hour: 14 },
    });
    expect(up).toEqual({
      lead: "Traffic is up",
      figure: "+18%",
      tail: "on last week, busiest on Tuesdays around 14:00 UTC.",
      next: "usage",
    });
    expect(
      headline({ failing: 0, traffic: quiet, deploys: deploys(3, 1), peak: null }).figure,
    ).toBe("75%");
    expect(
      headline({ failing: 0, traffic: quiet, deploys: deploys(0, 0), peak: null }).figure,
    ).toBe("ready");
  });
});
