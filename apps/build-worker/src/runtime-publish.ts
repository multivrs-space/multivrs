import { getSandbox, type Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import {
  RUNTIME_ORIGIN_HEADER,
  RUNTIME_ORIGIN_VARIABLE,
  runtimeOriginKey,
  runtimeScriptName,
} from "@multivrs/client/runtime-worker";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog } from "./control-plane";
import { PUBLISH_ROOT, transferRuntimeBundle } from "./runtime-bundle";

const SAFE_NAME = /^[a-z0-9][a-z0-9-_]{0,62}$/;
const PUBLISH_TIMEOUT_MS = 10 * 60 * 1_000;
/** Installed in the image (see Dockerfile), never from the customer's project. */
const WRANGLER = "/root/.bun/bin/wrangler";

/**
 * Entry wrapped around the OpenNext worker. It rejects requests that don't
 * carry this deployment's origin key (so the workers.dev URL can't bypass the
 * serve Worker) and restores the public host before Next sees the request.
 */
const RUNTIME_ENTRY = `import worker from "../.open-next/worker.js";
export * from "../.open-next/worker.js";

export default {
  ...worker,
  async fetch(request, env, ctx) {
    if (request.headers.get("${RUNTIME_ORIGIN_HEADER}") !== env.${RUNTIME_ORIGIN_VARIABLE}) {
      return new Response("Not found", { status: 404 });
    }
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host");
    const proto = request.headers.get("x-forwarded-proto");
    if (host) url.host = host;
    if (proto === "http" || proto === "https") url.protocol = proto + ":";
    const headers = new Headers(request.headers);
    headers.delete("${RUNTIME_ORIGIN_HEADER}");
    return worker.fetch(new Request(url, new Request(request, { headers })), env, ctx);
  },
};
`;

interface RuntimeTarget {
  /** Dispatch namespace when Workers for Platforms is available. */
  namespace: string | null;
  originSecret: string | null;
}

function runtimeTarget(env: BuildWorkerEnv): RuntimeTarget {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    throw new BuildCommandError(
      "Server runtime publishing is not configured for production builds.",
    );
  }
  const namespace = env.DISPATCH_NAMESPACE?.trim() || null;
  if (namespace) {
    if (!SAFE_NAME.test(namespace)) {
      throw new BuildCommandError("Server runtime namespace is invalid.");
    }
    return { namespace, originSecret: null };
  }
  if (!env.RUNTIME_ORIGIN_SECRET) {
    throw new BuildCommandError(
      "Server runtime publishing is not configured for production builds.",
    );
  }
  return { namespace: null, originSecret: env.RUNTIME_ORIGIN_SECRET };
}

function wranglerConfig(
  name: string,
  main: string,
  variables: Record<string, string>,
  standalone: boolean,
) {
  return {
    name,
    main,
    compatibility_date: "2026-07-26",
    compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
    assets: { directory: "../.open-next/assets", binding: "ASSETS" },
    observability: { enabled: true },
    // Standalone runtimes are reached by the serve Worker over workers.dev.
    ...(standalone ? { workers_dev: true, preview_urls: false } : {}),
    vars: variables,
  };
}

export async function publishRuntime(
  build: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
) {
  const nextOutput = await build.exec("test -f .open-next/worker.js", { cwd });
  if (job.framework !== "nextjs" && !nextOutput.success) return;
  const target = runtimeTarget(env);
  if (!SAFE_NAME.test(job.deploymentId)) {
    throw new BuildCommandError("Deployment ID cannot be used as a Worker name.");
  }
  await appendBuildLog(job, "info", "Publishing server runtime");
  const publisher = getSandbox(env.Sandbox, `publish-${job.deploymentId}`);
  try {
    await transferRuntimeBundle(build, publisher, job, env, cwd);
    const variables = { ...(job.input.env ?? {}) };
    let main = "../.open-next/worker.js";
    let name = job.deploymentId;
    if (target.originSecret) {
      name = runtimeScriptName(job.deploymentId);
      main = "./runtime-entry.mjs";
      variables[RUNTIME_ORIGIN_VARIABLE] = await runtimeOriginKey(
        target.originSecret,
        job.deploymentId,
      );
      await publisher.writeFile(`${PUBLISH_ROOT}/.multivrs/runtime-entry.mjs`, RUNTIME_ENTRY);
    }
    const configPath = `${PUBLISH_ROOT}/.multivrs/runtime-wrangler.jsonc`;
    await publisher.writeFile(
      configPath,
      JSON.stringify(wranglerConfig(name, main, variables, !target.namespace)),
    );
    const namespaceFlag = target.namespace ? ` --dispatch-namespace ${target.namespace}` : "";
    const result = await publisher.exec(
      `${WRANGLER} deploy --config ${configPath} --name ${name}${namespaceFlag}`,
      {
        cwd: PUBLISH_ROOT,
        timeout: PUBLISH_TIMEOUT_MS,
        env: {
          CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
        },
      },
    );
    if (!result.success) {
      console.error("runtime publish failed", result.stderr);
      throw new BuildCommandError("Server runtime publish failed.");
    }
  } finally {
    await publisher.destroy();
  }
  await appendBuildLog(job, "info", "Server runtime published");
}
