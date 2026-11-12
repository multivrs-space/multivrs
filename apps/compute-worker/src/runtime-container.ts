import { Container } from "@cloudflare/containers";
import { keepWarmActive, recordKeepWarm } from "./keep-warm";
import type { RuntimeRequest } from "./request";
import type { Env } from "./types";

const APP_ROOT = "/runtime/app";
const PORT = 8080;
/** How long a confirmed-running app is trusted before checking it again. */
const TRUST_MS = 30_000;
/** Runtime logs are drained at most this often, not after every request. */
const FLUSH_EVERY_MS = 5_000;
type RuntimeState = Pick<
  RuntimeRequest,
  "artifactHash" | "deploymentId" | "entrypoint" | "environment" | "runtime"
>;
type RuntimeLogLine = { level: "info" | "error"; message: string };

export class SwiftRustContainer extends Container<Env> {
  defaultPort = PORT;
  sleepAfter = "10m";
  enableInternet = false;
  private flushPromise?: Promise<void>;
  private lastFlush = 0;
  /** The runtime this instance last confirmed serving, and when. */
  private confirmed?: { key: string; at: number };

  async setKeepWarm(keepWarm: boolean): Promise<void> {
    await recordKeepWarm(this.ctx.storage, keepWarm);
  }

  /** Paid production deployments renew instead of sleeping; see keep-warm.ts. */
  async onActivityExpired(): Promise<void> {
    if (await keepWarmActive(this.ctx.storage)) {
      this.renewActivityTimeout();
      return;
    }
    await super.onActivityExpired();
  }

  /**
   * Whether this exact runtime is up. Recently confirmed means yes with no
   * round trips into the container; otherwise the process and port are
   * checked. A request that then fails calls `forgetRuntime` and retries.
   */
  async ensureRuntime(state: RuntimeState): Promise<boolean> {
    const key = JSON.stringify(state);
    const recent = this.confirmed;
    if (recent?.key === key && Date.now() - recent.at < TRUST_MS && this.runtime.running) {
      return true;
    }
    await this.ensureContainer();
    const current = await this.ctx.storage.get<RuntimeState>("runtimeState");
    const pid = await this.ctx.storage.get<number>("runtimePid");
    if (JSON.stringify(current) !== key || !pid || !(await this.isAlive(pid))) {
      this.confirmed = undefined;
      return false;
    }
    await this.waitForPort({ portToCheck: PORT, retries: 4, waitInterval: 100 });
    this.confirmed = { key, at: Date.now() };
    return true;
  }

  /** A request to the app failed: check it properly before trusting it again. */
  async forgetRuntime(): Promise<void> {
    this.confirmed = undefined;
  }

  async prepareRuntime(): Promise<void> {
    this.confirmed = undefined;
    await this.ensureContainer();
    await this.stopRuntime();
    // A fresh or woken container has no app folder yet: create it, then empty it.
    const cleaned = await this.runtime.exec(
      ["sh", "-c", 'mkdir -p "$1" && find "$1" -mindepth 1 -delete', "sh", APP_ROOT],
      { stdout: "ignore", stderr: "pipe" },
    );
    const result = await cleaned.output();
    if (result.exitCode !== 0) {
      const detail = new TextDecoder().decode(result.stderr).trim();
      throw new Error(`Could not clear the runtime directory: ${detail || "unknown error"}`);
    }
  }

  /** Unpack the whole app from one streamed archive (see tar-stream.ts). */
  async installArchive(archive: ReadableStream<Uint8Array>): Promise<void> {
    const unpack = await this.runtime.exec(["sh", "-c", 'tar -x -C "$1"', "sh", APP_ROOT], {
      stdin: archive,
      stdout: "ignore",
      stderr: "pipe",
    });
    const result = await unpack.output();
    if (result.exitCode !== 0) {
      const detail = new TextDecoder().decode(result.stderr).trim();
      throw new Error(`Could not unpack the app: ${detail || "unknown error"}`);
    }
  }

  async installFile(path: string, body: ReadableStream<Uint8Array>): Promise<void> {
    const destination = `${APP_ROOT}/${path}`;
    const upload = await this.runtime.exec(
      ["sh", "-c", 'mkdir -p "$(dirname "$1")" && tee "$1"', "sh", destination],
      { stdin: body, stdout: "ignore", stderr: "ignore" },
    );
    if ((await upload.exitCode) !== 0) throw new Error(`Could not install ${path}`);
  }

  async activateRuntime(state: RuntimeState): Promise<void> {
    const executable = `${APP_ROOT}/${state.entrypoint}`;
    const chmod = await this.runtime.exec(["chmod", "0555", executable], { stdout: "ignore" });
    if ((await chmod.exitCode) !== 0) throw new Error("Runtime entrypoint is missing");
    await this.startRuntime(state);
  }

  async flushRuntimeLogs(): Promise<void> {
    if (this.flushPromise) return this.flushPromise;
    if (Date.now() - this.lastFlush < FLUSH_EVERY_MS) return;
    this.lastFlush = Date.now();
    this.flushPromise = this.flushRuntimeLogsOnce().finally(() => {
      this.flushPromise = undefined;
    });
    return this.flushPromise;
  }

  private async startRuntime(state: RuntimeState): Promise<void> {
    const executable = `${APP_ROOT}/${state.entrypoint}`;
    const command = runtimeCommand(state.runtime, executable);
    const process = await this.runtime.exec(
      [
        "sh",
        "-c",
        'exec "$@" >> "$MULTIVRS_STDOUT_LOG" 2>> "$MULTIVRS_STDERR_LOG"',
        "sh",
        ...command,
      ],
      {
        cwd: APP_ROOT,
        env: {
          ...state.environment,
          BUNDLE_GEMFILE: `${APP_ROOT}/Gemfile`,
          BUNDLE_PATH: `${APP_ROOT}/vendor/bundle`,
          HOST: "0.0.0.0",
          MULTIVRS: "1",
          MULTIVRS_STDERR_LOG: "/tmp/multivrs-runtime.stderr",
          MULTIVRS_STDOUT_LOG: "/tmp/multivrs-runtime.stdout",
          PORT: String(PORT),
          PYTHONPATH: `${APP_ROOT}/vendor`,
        },
        stdout: "ignore",
        stderr: "ignore",
      },
    );
    await this.ctx.storage.put("runtimePid", process.pid);
    await this.ctx.storage.put("runtimeState", state);
    await this.waitForPort({ portToCheck: PORT, retries: 60, waitInterval: 250 });
    this.confirmed = { key: JSON.stringify(state), at: Date.now() };
  }

  private async stopRuntime(): Promise<void> {
    const pid = await this.ctx.storage.get<number>("runtimePid");
    if (pid && (await this.isAlive(pid))) {
      // The image has no kill binary; the shell's built-in one is always there.
      await this.runtime.exec(["sh", "-c", 'kill "$1"', "sh", String(pid)], {
        stdout: "ignore",
        stderr: "ignore",
      });
    }
    await this.ctx.storage.delete("runtimePid");
    await this.ctx.storage.delete("runtimeState");
  }

  private async flushRuntimeLogsOnce(): Promise<void> {
    const state = await this.ctx.storage.get<RuntimeState>("runtimeState");
    if (!state || !this.runtime.running) return;
    const [stdout, stderr] = await Promise.all([
      this.drainLogFile("/tmp/multivrs-runtime.stdout"),
      this.drainLogFile("/tmp/multivrs-runtime.stderr"),
    ]);
    const pending = await this.ctx.storage.get<RuntimeLogLine[]>("pendingRuntimeLogs");
    const logs = [
      ...(pending ?? []),
      ...toLogLines(stdout, "info"),
      ...toLogLines(stderr, "error"),
    ].slice(-200);
    if (!logs.length) return;
    await this.ctx.storage.put("pendingRuntimeLogs", logs);
    const endpoint = new URL("/api/runtime/logs", this.env.CONTROL_PLANE_URL);
    const headers = new Headers({ "content-type": "application/json" });
    if (this.env.CONTROL_PLANE_TOKEN) {
      headers.set("authorization", `Bearer ${this.env.CONTROL_PLANE_TOKEN}`);
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ deploymentId: state.deploymentId, logs }),
    });
    if (!response.ok) throw new Error(`Runtime log ingestion returned ${response.status}`);
    await this.ctx.storage.delete("pendingRuntimeLogs");
  }

  private async drainLogFile(path: string): Promise<string> {
    const process = await this.runtime.exec(
      ["sh", "-c", 'test -f "$1" && tail -c 262144 "$1"; : > "$1"', "sh", path],
      { stdout: "pipe", stderr: "ignore" },
    );
    const output = await process.output();
    return new TextDecoder().decode(output.stdout);
  }

  private async ensureContainer(): Promise<void> {
    if (!this.runtime.running) await this.start({ enableInternet: false });
  }

  private async isAlive(pid: number): Promise<boolean> {
    const check = await this.runtime.exec(["sh", "-c", 'kill -0 "$1"', "sh", String(pid)], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return (await check.exitCode) === 0;
  }

  private get runtime(): NonNullable<(typeof this.ctx)["container"]> {
    const runtime = this.ctx.container;
    if (!runtime) throw new Error("Runtime container binding is unavailable");
    return runtime;
  }
}

function toLogLines(value: string, level: "info" | "error"): RuntimeLogLine[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((message) => ({ level, message: message.slice(0, 16_000) }));
}

function runtimeCommand(runtime: RuntimeState["runtime"], entrypoint: string): string[] {
  if (runtime === "node") return ["node", entrypoint];
  if (runtime === "python") return ["python3", entrypoint];
  if (runtime === "ruby") return ["bundle", "exec", "ruby", entrypoint];
  if (runtime === "bun" && /\.[cm]?[jt]sx?$/.test(entrypoint)) return ["bun", entrypoint];
  return [entrypoint];
}
