import { describe, expect, it } from "bun:test";
import type { EntitlementContext } from "../../apps/web/src/lib/payments/billing.types";
import {
  metricAllowance,
  resourceLimit,
} from "../../apps/web/src/lib/payments/billing-calculation";
import {
  hourEnd,
  reconcileKey,
  reconcileWindow,
} from "../../apps/web/src/lib/payments/reconcile-window";

function context(overrides: Partial<EntitlementContext> = {}): EntitlementContext {
  return {
    addOns: {},
    entitlementOverrides: {},
    isLimitExempt: false,
    overageRateOverrides: {},
    overagesEnabled: false,
    plan: "hobby",
    spendLimitCents: null,
    ...overrides,
  };
}

describe("usage reconcile window", () => {
  it("covers the last 48 closed hours, leaving time for late edge writes", () => {
    const { start, end } = reconcileWindow(new Date("2026-10-27T00:17:00Z"));
    expect(end.toISOString()).toBe("2026-10-27T00:00:00.000Z");
    expect(start.toISOString()).toBe("2026-10-25T00:00:00.000Z");
    // Two minutes after the hour, that hour hasn't settled yet.
    expect(reconcileWindow(new Date("2026-10-27T13:02:00Z")).end.toISOString()).toBe(
      "2026-10-27T12:00:00.000Z",
    );
  });

  it("a daily run overlaps the previous one, so no hour is ever skipped", () => {
    const today = reconcileWindow(new Date("2026-10-27T00:17:00Z"));
    const yesterday = reconcileWindow(new Date("2026-10-26T00:17:00Z"));
    expect(today.start.getTime()).toBeLessThan(yesterday.end.getTime());
  });

  it("keys each hour by its end, the same way as before the fix", () => {
    const end = hourEnd("2026-10-27 13:00:00");
    expect(end?.toISOString()).toBe("2026-10-27T14:00:00.000Z");
    expect(hourEnd("not a time")).toBeNull();
    expect(reconcileKey("p1", "edge_requests", end ?? new Date(0))).toBe(
      "cf:p1:edge_requests:2026-10-27T14:00:00.000Z",
    );
  });
});

describe("enterprise allowances", () => {
  it("start from Pro instead of being unlimited", () => {
    expect(metricAllowance(context({ plan: "enterprise" }), "edge_requests")).toBe(1_000_000n);
    expect(resourceLimit(context({ plan: "enterprise" }), "projects")).toBe(20);
  });

  it("follow the contract's overrides", () => {
    const contract = context({
      plan: "enterprise",
      entitlementOverrides: { edge_requests: 50_000_000, projects: 500 },
    });
    expect(metricAllowance(contract, "edge_requests")).toBe(50_000_000n);
    expect(resourceLimit(contract, "projects")).toBe(500);
  });

  it("only the limit-exempt team account has no cap", () => {
    const team = context({ plan: "hobby", isLimitExempt: true });
    expect(metricAllowance(team, "edge_requests")).toBeNull();
    expect(resourceLimit(team, "projects")).toBeNull();
  });
});
