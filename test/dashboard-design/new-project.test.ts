import { describe, expect, test } from "bun:test";
import { buildPhases, currentPhase } from "../../apps/web/src/features/dashboard/lib/build-phases";
import { deployBlocker } from "../../apps/web/src/features/dashboard/lib/deploy-blocker";
import { parseDotenv } from "../../apps/web/src/features/dashboard/lib/dotenv";
import type { DeploymentImportConfig } from "../../apps/web/src/features/dashboard/types/deployment-import.types";

const states = (messages: string[], status: string) =>
  buildPhases(messages, status).map((phase) => phase.state);

describe("build phases from log lines", () => {
  test("a queued build with no lines is getting a machine", () => {
    expect(states([], "queued")).toEqual(["running", "waiting", "waiting", "waiting"]);
  });

  test("a finished step hands over to the next one with its time", () => {
    const phases = buildPhases(
      [
        "Starting build environment",
        "Build machine ready in 3.2s · reused, packages cached",
        "Detected Next.js · deploying to production",
      ],
      "building",
    );
    expect(phases.map((phase) => phase.state)).toEqual(["done", "running", "waiting", "waiting"]);
    expect(phases[0]?.duration).toBe("3.2s");
    expect(currentPhase(phases)?.id).toBe("install");
  });

  test("a project with no install step marks it not needed", () => {
    expect(
      states(
        [
          "Starting build environment",
          "Build machine ready in 1s",
          "Building with Static",
          "Built in 0.4s",
          "Uploading 12 files",
        ],
        "building",
      ),
    ).toEqual(["done", "skipped", "done", "running"]);
  });

  test("a failed build stops on the step that broke", () => {
    expect(
      states(
        [
          "Starting build environment",
          "Build machine ready in 2s",
          "Installing dependencies with bun",
          "Installed dependencies in 2.7s",
          "Building with Next.js",
          "Building with Next.js failed: Type error",
        ],
        "error",
      ),
    ).toEqual(["done", "done", "failed", "waiting"]);
  });

  test("the upload time is read before the summary that follows it", () => {
    const phases = buildPhases(
      ["Uploading 3 files", "Uploaded in 0.8s · ready in 12s · https://a.app"],
      "ready",
    );
    expect(phases[3]?.duration).toBe("0.8s");
  });

  test("a server app keeps deploying until the server is published", () => {
    const lines = [
      "Building with Next.js",
      "Built in 9s",
      "Uploading 40 files",
      "Uploaded in 1s · ready in 20s",
      "Publishing the server",
    ];
    expect(buildPhases(lines, "building")[3]?.state).toBe("running");
    expect(buildPhases([...lines, "Server published"], "ready")[3]?.state).toBe("done");
  });

  test("set-up covers the machine, the clone and the cache", () => {
    const lines = [
      { message: "Starting build environment", createdAt: "2026-10-28T10:00:00Z" },
      {
        message: "Machine started in 1.2s · reused, packages cached",
        createdAt: "2026-10-28T10:00:01Z",
      },
      { message: "Cloned github.com/acme/site (main) in 0.6s", createdAt: "2026-10-28T10:00:02Z" },
    ];
    const running = buildPhases(lines, "building");
    expect(running[0]?.state).toBe("running");
    expect(running[0]?.startedAt).toBe("2026-10-28T10:00:00Z");
    const ready = buildPhases(
      [...lines, { message: "Build machine ready in 2.1s", createdAt: "2026-10-28T10:00:03Z" }],
      "building",
    );
    expect(ready[0]?.duration).toBe("2.1s");
    // Install has no line yet: its clock starts at the last line that arrived.
    expect(ready[1]?.state).toBe("running");
    expect(ready[1]?.startedAt).toBe("2026-10-28T10:00:03Z");
  });

  test("an older ready build without step lines shows every step done", () => {
    expect(states(["some output"], "ready")).toEqual(["done", "done", "done", "done"]);
  });
});

describe("pasting a .env file", () => {
  test("reads names, values, quotes, exports and comments", () => {
    expect(
      parseDotenv(
        "# app\nAPI_URL=https://api.test\nexport TOKEN=\"a b\"\nNAME='x' \nPORT=3000 # local\n\n",
      ),
    ).toEqual([
      { key: "API_URL", value: "https://api.test" },
      { key: "TOKEN", value: "a b" },
      { key: "NAME", value: "x" },
      { key: "PORT", value: "3000" },
    ]);
  });

  test("plain text is not treated as a .env file", () => {
    expect(parseDotenv("API_URL")).toBeNull();
    expect(parseDotenv("hello world")).toBeNull();
  });
});

describe("what stops Deploy", () => {
  const config: DeploymentImportConfig = {
    buildCommand: "",
    environment: [{ id: "a", key: "", value: "" }],
    framework: "nextjs",
    installCommand: "",
    outputDirectory: "",
    projectName: "site",
    rootDirectory: ".",
  };
  const url = "https://github.com/acme/site";

  test("a complete form can deploy", () => {
    expect(deployBlocker(config, "detected", url)).toBeNull();
    expect(deployBlocker(config, "failed", url)).toBeNull();
  });

  test("each problem is named in plain words", () => {
    expect(deployBlocker(config, "detecting", url)).toContain("Reading");
    expect(deployBlocker({ ...config, projectName: " " }, "detected", url)).toContain("name");
    expect(deployBlocker(config, "detected", "")).toContain("repository");
    const rows = (keys: string[]) => ({
      ...config,
      environment: keys.map((key) => ({ id: key, key, value: "1" })),
    });
    expect(deployBlocker(rows(["1BAD"]), "detected", url)).toContain("red");
    expect(deployBlocker(rows(["A", "A"]), "detected", url)).toContain("share");
  });
});
