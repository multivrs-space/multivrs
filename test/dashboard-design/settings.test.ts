import { describe, expect, test } from "bun:test";
import {
  activityCategory,
  byMonth,
  describeActivity,
  inWindow,
} from "../../apps/web/src/features/dashboard/components/account/activity/activity-events";
import { qrModules } from "../../apps/web/src/features/dashboard/components/account/auth/totp-qr";

const event = (
  action: string,
  createdAt = "2026-10-20T10:00:00Z",
  extra: Record<string, unknown> = {},
) =>
  ({
    id: `${action}-${createdAt}`,
    action,
    createdAt,
    metadata: extra,
    projectName: null,
  }) as unknown as Parameters<typeof describeActivity>[0];

describe("account activity", () => {
  test("actions fall into the filter people expect", () => {
    expect(activityCategory("auth.login")).toBe("sign-in");
    expect(activityCategory("oauth.connected")).toBe("sign-in");
    expect(activityCategory("user.2fa_enabled")).toBe("security");
    expect(activityCategory("api_token.create")).toBe("tokens");
    expect(activityCategory("deployment.create")).toBe("projects");
    expect(activityCategory("account.update_profile")).toBe("account");
  });

  test("sentences bold the thing that changed", () => {
    expect(describeActivity(event("oauth.connected", undefined, { providerId: "google" }))).toEqual(
      { before: "You connected ", strong: "Google", after: "." },
    );
    expect(describeActivity(event("auth.login"))).toEqual({ before: "You signed in." });
    expect(describeActivity(event("billing.plan_changed")).strong).toBe("billing plan changed");
  });

  test("time windows and month groups", () => {
    const now = Date.parse("2026-10-27T10:00:00Z");
    expect(inWindow("2026-10-26T12:00:00Z", "24h", now)).toBe(true);
    expect(inWindow("2026-10-20T10:00:00Z", "7d", now)).toBe(true);
    expect(inWindow("2026-10-01T10:00:00Z", "7d", now)).toBe(false);
    expect(inWindow("2020-01-01T00:00:00Z", "all", now)).toBe(true);
    const groups = byMonth([
      event("auth.login", "2026-10-02T00:00:00Z"),
      event("auth.logout", "2026-09-30T23:00:00Z"),
    ]);
    expect(groups.map(([month]) => month)).toEqual(["October 2026", "September 2026"]);
  });
});

describe("two-factor QR code", () => {
  test("the authenticator link encodes with all three finder squares", () => {
    const { data, size, path } = qrModules(
      "otpauth://totp/Multivrs:ada%40studio.dev?secret=JBSWY3DPEHPK3PXP&issuer=Multivrs",
    );
    expect(path.startsWith("M2 2h1v1h-1z")).toBe(true);
    expect(size).toBe(data.length);
    // A finder square: a dark 7×7 ring with a dark 3×3 centre, starting after the border.
    const finder = (top: number, left: number) =>
      [0, 6].every((edge) =>
        [0, 1, 2, 3, 4, 5, 6].every(
          (i) => data[top + edge]?.[left + i] && data[top + i]?.[left + edge],
        ),
      ) &&
      data[top + 3]?.[left + 3] === true &&
      data[top + 1]?.[left + 1] === false;
    expect(finder(2, 2)).toBe(true);
    expect(finder(2, size - 9)).toBe(true);
    expect(finder(size - 9, 2)).toBe(true);
  });
});
