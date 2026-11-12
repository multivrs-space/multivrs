import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";

/** Per build, so its files are wiped with the build's lease. */
const archive = (job: BuildJob) => `/tmp/multivrs-${job.deploymentId}-runtime.tgz`;

function bundleKey(job: BuildJob): string {
  return `runtime-bundles/${job.deploymentId}.tgz`;
}

/**
 * Copy the built `.open-next` output from the customer's build sandbox into a
 * separate publish machine, staging it in R2. Only build output crosses over:
 * nothing the customer's build left running can see the publish credentials.
 */
export async function transferRuntimeBundle(
  build: Sandbox,
  publisher: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
  publishRoot: string,
): Promise<void> {
  const archived = await build.exec(`tar -czf ${archive(job)} .open-next`, { cwd });
  if (!archived.success) {
    throw new BuildCommandError("Could not package the server runtime.");
  }
  const file = await build.readFile(archive(job), { encoding: "none" });
  const fixed = new FixedLengthStream(file.size);
  await Promise.all([
    file.content.pipeTo(fixed.writable),
    env.BUILD_CACHE.put(bundleKey(job), fixed.readable),
  ]);
  try {
    const staged = await env.BUILD_CACHE.get(bundleKey(job));
    if (!staged?.body) {
      throw new BuildCommandError("Could not stage the server runtime.");
    }
    await publisher.mkdir(`${publishRoot}/.multivrs`, { recursive: true });
    await publisher.writeFile(archive(job), staged.body);
    const extracted = await publisher.exec(`tar -xzf ${archive(job)}`, {
      cwd: publishRoot,
    });
    if (!extracted.success) {
      throw new BuildCommandError("Could not unpack the server runtime.");
    }
  } finally {
    await env.BUILD_CACHE.delete(bundleKey(job));
  }
}
