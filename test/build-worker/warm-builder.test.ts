import { describe, expect, test } from "bun:test";
import { warmBuilderId } from "../../apps/build-worker/src/warm-builder-id";

describe("warm build machines", () => {
  test("one per account, stable, and never shared across accounts", async () => {
    const a = await warmBuilderId({ accountId: "user_A", projectId: "p1" });
    expect(await warmBuilderId({ accountId: "user_A", projectId: "p2" })).toBe(a);
    expect(await warmBuilderId({ accountId: "user_a", projectId: "p1" })).not.toBe(a);
    expect(a).toMatch(/^builder-[0-9a-f]{32}$/);
  });

  test("jobs from before account ids fall back to one machine per project", async () => {
    const project = await warmBuilderId({ projectId: "p1" });
    expect(project).not.toBe(await warmBuilderId({ accountId: "p1", projectId: "x" }));
    expect(await warmBuilderId({ projectId: "p1" })).toBe(project);
  });
});
