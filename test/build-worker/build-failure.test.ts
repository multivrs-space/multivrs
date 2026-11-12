import { describe, expect, test } from "bun:test";
import {
  appendTail,
  buildFailureMessage,
  failureReason,
} from "../../apps/build-worker/src/build-failure";

describe("build failure messages", () => {
  test("name the line that explains the failure, without colour codes", () => {
    const output = [
      "  • running bun install",
      "Checked 412 packages",
      "\u001b[31mError: Cannot find module 'wrangler'\u001b[0m",
      "    at resolve (node:internal/modules:1:1)",
      "Done in 1.2s",
    ].join("\n");
    expect(failureReason(output)).toBe("Error: Cannot find module 'wrangler'");
    expect(buildFailureMessage(1, output)).toBe("Cannot find module 'wrangler'");
  });

  test("fall back to the last line, and ignore '0 errors'", () => {
    expect(failureReason("compiled with 0 errors\nKilled")).toBe("Killed");
    expect(buildFailureMessage(undefined, "")).toBe("Build failed (exit code unknown).");
  });

  test("keep only the end of very long output", () => {
    const tail = appendTail("x".repeat(7_990), "y".repeat(20));
    expect(tail).toHaveLength(8_000);
    expect(tail.endsWith("y".repeat(20))).toBe(true);
  });
});
