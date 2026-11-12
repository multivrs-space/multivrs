import type { BuildJob } from "@multivrs/client";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog, recordBuildSource, recordBuildUsage } from "./control-plane";
import { capturePreview } from "./preview-capture";
import { restoreRemoteCache, saveRemoteCache } from "./remote-cache";
import { publishRuntime } from "./runtime-publish";
import { streamBuildCommand } from "./stream-build";
import { warmBuilderId } from "./warm-builder-id";
import { leaseSandbox } from "./warm-sandbox";

const BUILD_TIMEOUT_MS = 45 * 60 * 1_000;

function checkoutUrl(job: BuildJob) {
  if (!job.repositoryToken) return job.input.repoUrl;
  const url = new URL(job.input.repoUrl);
  url.username = "x-access-token";
  url.password = job.repositoryToken;
  return url.toString();
}

/** "github.com/acme/site" for the log, never the token-bearing clone URL. */
function repositoryLabel(job: BuildJob) {
  return job.input.repoUrl.replace(/^https?:\/\//, "").replace(/\.git$/, "");
}

/** " (main · 1fb4ee4)", or "" when neither is known. */
function sourceLabel(branch: string | undefined, commit: string | null) {
  const parts = [branch, commit?.slice(0, 7)].filter(Boolean);
  return parts.length ? ` (${parts.join(" · ")})` : "";
}

/** "2.7s", "14s": elapsed since `from`, as the build log shows it. */
function seconds(from: number) {
  const value = (Date.now() - from) / 1_000;
  return value < 10 ? `${value.toFixed(1)}s` : `${Math.round(value)}s`;
}

function workingDirectory(checkout: string, rootDirectory?: string) {
  const root = rootDirectory?.trim() || ".";
  const segments = root.split("/").filter((segment) => segment && segment !== ".");
  if (root.startsWith("/") || segments.includes("..")) {
    throw new BuildCommandError("Root directory must stay inside the repository.");
  }
  return segments.length ? `${checkout}/${segments.join("/")}` : checkout;
}

function commandEnvironment(job: BuildJob) {
  return {
    ...job.input.env,
    MULTIVRS_API_URL: job.apiUrl,
    MULTIVRS_TOKEN: job.apiToken,
    MULTIVRS_DEPLOYMENT_ID: job.deploymentId,
    // Everything the CLI prints is streamed into the log; it needn't post steps too.
    MULTIVRS_LOG_STREAMED: "1",
    // The sandbox base image ships bun here (see the Dockerfile check).
    MULTIVRS_BUN_BINARY: "/usr/local/bin/bun",
    ...(job.framework ? { MULTIVRS_FRAMEWORK: job.framework } : {}),
    ...(job.input.buildCommand ? { MULTIVRS_BUILD_COMMAND: job.input.buildCommand } : {}),
    ...(job.input.installCommand ? { MULTIVRS_INSTALL_COMMAND: job.input.installCommand } : {}),
    ...(job.input.outputDirectory ? { MULTIVRS_OUTPUT_DIRECTORY: job.input.outputDirectory } : {}),
  };
}

export async function executeBuild(job: BuildJob, env: BuildWorkerEnv) {
  const startedAt = Date.now();
  await appendBuildLog(job, "info", "Starting build environment");
  // One warm machine per account: consecutive builds skip the cold start.
  const lease = await leaseSandbox(env, {
    warm: await warmBuilderId(job),
    fresh: `deployment-${job.deploymentId}`,
    build: job.deploymentId,
  });
  const { sandbox } = lease;
  const checkout = `${lease.root}/project`;
  try {
    await sandbox.mkdir(lease.root, { recursive: true });
    await appendBuildLog(
      job,
      "info",
      `Machine started in ${seconds(startedAt)} · ${lease.reused ? "reused, packages cached" : "fresh machine"}`,
    );
    const cloneStarted = Date.now();
    await sandbox.gitCheckout(checkoutUrl(job), {
      branch: job.input.branch,
      depth: 1,
      targetDir: checkout,
    });
    const cloned = seconds(cloneStarted);
    const head = (await sandbox.exec("git rev-parse HEAD", { cwd: checkout })).stdout.trim();
    const commit = /^[0-9a-f]{40}$/.test(head) ? head : null;
    await Promise.all([
      appendBuildLog(
        job,
        "info",
        `Cloned ${repositoryLabel(job)}${sourceLabel(job.input.branch, commit)} in ${cloned}`,
      ),
      commit ? recordBuildSource(job, commit).catch(() => undefined) : undefined,
    ]);
    if (job.repositoryToken) {
      await sandbox.exec("git remote remove origin", { cwd: checkout });
    }
    const cwd = workingDirectory(checkout, job.input.rootDirectory);
    await sandbox.mkdir(`${cwd}/.multivrs`, { recursive: true });
    await sandbox.writeFile(
      `${cwd}/.multivrs/project.json`,
      JSON.stringify({ project_id: job.projectId }),
    );
    const restoredBytes = await restoreRemoteCache(sandbox, job, env, cwd);
    if (restoredBytes > 0) {
      await Promise.all([
        appendBuildLog(job, "info", "Restored Multivrs remote build cache"),
        recordBuildUsage(job, "build_cache_read_bytes", restoredBytes),
      ]);
    }
    await appendBuildLog(job, "info", `Build machine ready in ${seconds(startedAt)}`);
    await streamBuildCommand(sandbox, job, {
      cwd,
      env: commandEnvironment(job),
      timeout: BUILD_TIMEOUT_MS,
    });
    await appendBuildLog(job, "info", `Finished in ${seconds(startedAt)} in total`);
    const savedBytes = await saveRemoteCache(sandbox, job, env, cwd);
    if (savedBytes > 0) {
      await Promise.all([
        appendBuildLog(job, "info", "Published Multivrs remote build cache"),
        recordBuildUsage(job, "build_cache_write_bytes", savedBytes),
      ]);
    }
    await publishRuntime(sandbox, job, env, cwd);
  } finally {
    await recordBuildUsage(job, "build_duration_ms_standard", Date.now() - startedAt).catch(
      () => undefined,
    );
    await lease.release();
  }
  // After the deployment is live: one screenshot for the dashboard.
  if (await capturePreview(job, env).catch(() => false)) {
    await appendBuildLog(job, "info", "Captured a preview of the live site").catch(() => undefined);
  }
}
