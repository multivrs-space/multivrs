import { describe, expect, test } from "bun:test";
import {
  axisTicks,
  labelStride,
  niceCeil,
  peakIndex,
  plotPoints,
  smoothPath,
} from "../../apps/web/src/components/dashboard/lib/chart-math";
import {
  formatCompact,
  percentChange,
  pointChange,
  shareOf,
} from "../../apps/web/src/components/dashboard/lib/format";
import {
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_NAV_ITEMS,
} from "../../apps/web/src/features/dashboard/constants/navigation";
import { OBSERVABILITY_NAVIGATION } from "../../apps/web/src/features/dashboard/constants/observability-navigation";
import { MAIL_NAVIGATION } from "../../apps/web/src/features/mail/mail-navigation";

describe("living icons", () => {
  const items = [
    ...DASHBOARD_NAV_ITEMS.map((item) => ({ name: item.name, icon: item.icon })),
    ...MAIL_NAVIGATION.flatMap((item) =>
      "icon" in item ? [{ name: item.label, icon: item.icon }] : [],
    ),
    ...OBSERVABILITY_NAVIGATION.flatMap((item) =>
      "icon" in item ? [{ name: item.label, icon: item.icon }] : [],
    ),
  ];

  test("every nav, mail and observability item has an animated icon", () => {
    for (const item of items) {
      expect(item.icon.iconName, item.name).toBeString();
      expect(item.icon.parts.length, item.name).toBeGreaterThan(0);
    }
  });

  test("every icon moves at least one part", () => {
    type Part = { motion?: string; parts?: Part[] };
    const moves = (parts: readonly Part[]): boolean =>
      parts.some((part) => Boolean(part.motion) || moves(part.parts ?? []));
    for (const item of items) expect(moves(item.icon.parts), item.name).toBeTrue();
  });

  test("every rail item sits in a known group", () => {
    const groups = new Set<string>([...DASHBOARD_NAV_GROUPS.map((group) => group.id), "settings"]);
    for (const item of DASHBOARD_NAV_ITEMS) expect(groups.has(item.group), item.name).toBeTrue();
  });
});

describe("chart math", () => {
  test("niceCeil rounds up to a readable ceiling", () => {
    expect(niceCeil(0)).toBe(1);
    expect(niceCeil(7)).toBe(10);
    expect(niceCeil(180)).toBe(200);
    expect(niceCeil(230)).toBe(250);
    expect(niceCeil(4100)).toBe(5000);
  });

  test("axisTicks runs from the ceiling to zero", () => {
    expect(axisTicks(300, 3)).toEqual([300, 200, 100, 0]);
  });

  test("plotPoints centres each bucket and flips y", () => {
    const points = plotPoints([0, 10], 10, 100, 50);
    expect(points).toEqual([
      { x: 25, y: 50 },
      { x: 75, y: 0 },
    ]);
  });

  test("peakIndex and labelStride handle edge cases", () => {
    expect(peakIndex([])).toBe(-1);
    expect(peakIndex([0, 0])).toBe(-1);
    expect(peakIndex([3, 9, 4])).toBe(1);
    expect(labelStride(24, 6)).toBe(4);
    expect(labelStride(3, 6)).toBe(1);
  });

  test("smoothPath starts at the first point", () => {
    expect(smoothPath([])).toBe("");
    expect(
      smoothPath([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]).startsWith("M1,2C"),
    ).toBeTrue();
  });
});

describe("number formatting", () => {
  test("percentChange needs a real baseline", () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(5, 0)).toBeNull();
    expect(percentChange(5, null)).toBeNull();
    expect(percentChange(5, undefined)).toBeNull();
  });

  test("pointChange measures rate differences in points", () => {
    expect(pointChange(38, 41)).toBe(-3);
    expect(pointChange(38, null)).toBeNull();
  });

  test("formatCompact keeps small numbers whole", () => {
    expect(formatCompact(9_876)).toBe("9,876");
    expect(formatCompact(200_912)).toBe("200.9K");
    expect(shareOf(1, 0)).toBe(0);
  });
});

describe("observability views", () => {
  test("every sub-nav item resolves to its own view config", async () => {
    const { observabilityView } = await import(
      "../../apps/web/src/features/dashboard/constants/observability-views"
    );
    for (const item of OBSERVABILITY_NAVIGATION) {
      if (!("view" in item)) continue;
      const config = observabilityView(item.view);
      expect(config.view, item.label).toBe(item.view);
      expect(config.label, item.view).toBe(item.label);
      if (config.source === "usage") expect(config.usage?.length, item.view).toBeGreaterThan(0);
      if (config.source === "planned") expect(config.tracks?.length, item.view).toBeGreaterThan(0);
    }
    expect(observabilityView("nope").view).toBe("overview");
  });
});
