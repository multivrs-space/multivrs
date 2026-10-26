import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";

const ARCHIVE = "/tmp/multivrs-runtime.tgz";
export const PUBLISH_ROOT = "/workspace/publish";

function bundleKey(job: BuildJob): string {
  return `runtime-bundles/${job.deploymentId}.tgz`;
}

/**
 * Copy the built `.open-next` output from the customer's build sandbox into a
 * fresh publish sandbox, staging it in R2. Only build output crosses over:
 * nothing the customer's build left running can see the publish credentials.
 */
export async function transferRuntimeBundle(
  build: Sandbox,
  publisher: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
): Promise<void> {
  const archived = await build.exec(`tar -czf ${ARCHIVE} .open-next`, { cwd });
  if (!archived.success) {
    throw new BuildCommandError("Could not package the server runtime.");
  }
  const file = await build.readFile(ARCHIVE, { encoding: "none" });
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
    await publisher.mkdir(`${PUBLISH_ROOT}/.multivrs`, { recursive: true });
    await publisher.writeFile(ARCHIVE, staged.body);
    const extracted = await publisher.exec(`tar -xzf ${ARCHIVE}`, {
      cwd: PUBLISH_ROOT,
    });
    if (!extracted.success) {
      throw new BuildCommandError("Could not unpack the server runtime.");
    }
  } finally {
    await env.BUILD_CACHE.delete(bundleKey(job));
  }
}
