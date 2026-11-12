import { describe, expect, test } from "bun:test";
import {
  DASHBOARD_NAV_ITEMS,
  railSlugFor,
} from "../../apps/web/src/features/dashboard/constants/navigation";
import { observeTabsFor } from "../../apps/web/src/features/dashboard/constants/observe-tabs";
import { getSectionMeta } from "../../apps/web/src/features/dashboard/constants/sections";
import {
  errorType,
  fingerprint,
  groupIssues,
} from "../../apps/web/src/features/dashboard/lib/error-issues";
import {
  cameraFraming,
  countryLevels,
  trafficCentre,
} from "../../apps/web/src/features/dashboard/three/map/map-layout";

const NOW = Date.UTC(2026, 9, 27, 15);
const at = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString();
const event = (message: string, hours: number, deploymentId = "d1") => ({
  id: `${message}-${hours}`,
  message,
  at: at(hours),
  projectId: "p1",
  deploymentId,
});

describe("observe navigation", () => {
  test("Observe holds the whole suite, each with a description", () => {
    const observe = DASHBOARD_NAV_ITEMS.filter((item) => item.group === "observe");
    for (const item of observe) expect(getSectionMeta(item.slug)?.description).not.toBe("");
    expect(getSectionMeta("observability")?.title).toBe("Monitoring");
    expect(getSectionMeta("speed-insights")?.title).toBe("Performance");
  });

  test("the rail asks one question per entry; related views are tabs", () => {
    const rail = DASHBOARD_NAV_ITEMS.filter((item) => item.group === "observe" && !item.parent).map(
      (item) => item.slug,
    );
    expect(rail).toEqual([
      "analytics",
      "errors",
      "logs",
      "speed-insights",
      "observability",
      "alerts",
    ]);
    expect(observeTabsFor("product")?.map((tab) => tab.slug)).toEqual(["analytics", "product"]);
    expect(observeTabsFor("traces")?.map((tab) => tab.label)).toEqual(["Real users", "Traces"]);
    expect(observeTabsFor("uptime")?.map((tab) => tab.label)).toEqual(["Health", "Uptime"]);
    expect(observeTabsFor("errors")).toBeNull();
    expect(railSlugFor("traces")).toBe("speed-insights");
  });
});

describe("error issues", () => {
  test("occurrences that differ only in ids, numbers or quoted values group together", () => {
    expect(fingerprint("Error: timed out after 10000ms")).toBe(
      fingerprint("Error: timed out after 12000ms"),
    );
    expect(fingerprint("TypeError: Cannot read 'price' of undefined")).toBe(
      fingerprint("TypeError: Cannot read 'total' of undefined"),
    );
    expect(fingerprint("Error: a\n    at line 1")).toBe(fingerprint("Error: a\n    at line 99"));
  });

  test("the error type comes from the message", () => {
    expect(errorType("TypeError: x is undefined")).toBe("TypeError");
    expect(errorType("Uncaught ReferenceError: window is not defined")).toBe("ReferenceError");
    expect(errorType("Error: boom")).toBe("Error");
    expect(errorType("something odd happened")).toBe("Error");
  });

  test("issues count events, reach and newness, latest activity first", () => {
    const issues = groupIssues(
      [
        event("Error: payment timed out after 10000ms", 2, "d1"),
        event("Error: payment timed out after 9000ms", 50, "d2"),
        event("TypeError: x is undefined", 1),
      ],
      NOW,
    );
    expect(issues.map((issue) => issue.type)).toEqual(["TypeError", "Error"]);
    const payment = issues[1];
    expect(payment?.title).toBe("payment timed out after 10000ms");
    expect(payment?.count).toBe(2);
    expect(payment?.deployments).toBe(2);
    expect(payment?.isNew).toBe(false);
    expect(issues[0]?.isNew).toBe(true);
    expect(payment?.daily.reduce((sum, value) => sum + value, 0)).toBe(2);
    expect(payment?.daily).toHaveLength(14);
  });
});

describe("3D traffic map", () => {
  const items = [
    { code: "NG", value: 900 },
    { code: "GB", value: 100 },
  ];

  test("heights follow share, the busiest country at full height", () => {
    const levels = countryLevels(items);
    expect(levels.get("NG")).toBe(1);
    expect(levels.get("GB")).toBeCloseTo(Math.sqrt(100 / 900), 5);
  });

  test("the camera aims near the busiest country and sits above and south of it", () => {
    const centre = trafficCentre(items);
    const frame = cameraFraming(items, 2);
    expect(centre).not.toBeNull();
    expect(frame.target[0]).toBeCloseTo(centre?.[0] ?? 0, 5);
    expect(frame.position[1]).toBeGreaterThan(0);
    expect(frame.position[2]).toBeGreaterThan(frame.target[2]);
    expect(trafficCentre([])).toBeNull();
  });
});
