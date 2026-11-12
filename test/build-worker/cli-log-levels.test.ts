import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createDeploymentLogInputSchema } from "../../packages/client/src/contract";

const CLI_SOURCE = join(import.meta.dir, "../../packages/cli/src");

/** Every level the Rust CLI passes to `append_log`, from its source. */
function cliLogLevels(): string[] {
  return readdirSync(CLI_SOURCE)
    .filter((file) => file.endsWith(".rs"))
    .flatMap((file) =>
      [
        ...readFileSync(join(CLI_SOURCE, file), "utf8").matchAll(
          /append_log\([\s\S]*?,\s*"([a-z]+)",/g,
        ),
      ].map((match) => match[1] ?? ""),
    );
}

describe("CLI and API agree on log levels", () => {
  test("every level the CLI logs at is one the logs route accepts", () => {
    const levels = cliLogLevels();
    expect(levels.length).toBeGreaterThan(0);
    for (const level of levels) {
      expect(createDeploymentLogInputSchema.safeParse({ level, message: "x" }).success).toBe(true);
    }
  });
});
