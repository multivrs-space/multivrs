import { describe, expect, test } from "bun:test";
import {
  runtimeOriginKey,
  runtimeScriptName,
} from "../../packages/client/src/runtime-worker";

describe("runtime worker naming", () => {
  test("prefixes the deployment id", () => {
    expect(runtimeScriptName("cmh2x9k0a0000abcd")).toBe("mvd-cmh2x9k0a0000abcd");
  });

  test("produces a valid workers.dev label", () => {
    const name = runtimeScriptName(`Dep_${"x".repeat(80)}-`);
    expect(name.length).toBeLessThanOrEqual(63);
    expect(name).toMatch(/^[a-z0-9-]+$/);
    expect(name.endsWith("-")).toBe(false);
  });
});

describe("runtime origin key", () => {
  test("is stable per deployment and differs across deployments", async () => {
    const a = await runtimeOriginKey("secret", "dep-a");
    expect(await runtimeOriginKey("secret", "dep-a")).toBe(a);
    expect(await runtimeOriginKey("secret", "dep-b")).not.toBe(a);
    expect(await runtimeOriginKey("other", "dep-a")).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
