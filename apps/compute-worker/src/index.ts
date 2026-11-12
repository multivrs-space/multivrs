import { getContainer } from "@cloudflare/containers";
import { loadArtifact } from "./artifact";
import { parseRuntimeRequest } from "./request";
import { SwiftRustContainer } from "./runtime-container";
import { type TarEntry, tarStream, ustarPath } from "./tar-stream";
import type { Env } from "./types";

export { SwiftRustContainer };

type Runtime = DurableObjectStub<SwiftRustContainer>;
type RuntimeState = Omit<NonNullable<ReturnType<typeof parseRuntimeRequest>>, "keepWarm">;

/** Make sure this deployment's app is running; a Response means it can't be. */
async function ensureServing(
  container: Runtime,
  env: Env,
  state: RuntimeState,
): Promise<Response | null> {
  if (await container.ensureRuntime(state)) return null;
  const manifest = await loadArtifact(env, state.artifactHash);
  if (!manifest.files.some((file) => file.path === state.entrypoint)) {
    return new Response("Runtime entrypoint not found", { status: 404 });
  }
  await container.prepareRuntime();
  if (manifest.files.every((file) => ustarPath(file.path))) {
    // One streamed archive, one command: the bulk of a cold start before.
    await container.installArchive(tarStream(runtimeFiles(env, manifest.files)));
  } else {
    for (const file of manifest.files) {
      const object = await env.ARTIFACTS.get(`blobs/${file.hash}`);
      if (!object?.body)
        return new Response(`Runtime file not found: ${file.path}`, { status: 404 });
      await container.installFile(file.path, object.body);
    }
  }
  await container.activateRuntime(state);
  return null;
}

/** Files to read ahead while the archive streams, so storage reads overlap. */
const LOOKAHEAD = 8;

async function* runtimeFiles(
  env: Env,
  files: readonly { hash: string; path: string }[],
): AsyncGenerator<TarEntry> {
  const pending: Promise<R2ObjectBody | null>[] = [];
  let next = 0;
  for (const file of files) {
    while (pending.length < LOOKAHEAD && next < files.length) {
      pending.push(env.ARTIFACTS.get(`blobs/${files[next]?.hash}`));
      next += 1;
    }
    const object = await pending.shift();
    if (!object?.body) throw new Error(`Runtime file not found: ${file.path}`);
    yield { path: file.path, size: object.size, body: object.body };
  }
}

async function invoke(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
  const runtimeRequest = parseRuntimeRequest(request);
  if (!runtimeRequest) {
    return new Response("Invalid runtime request", { status: 400 });
  }
  // keepWarm is policy, not runtime identity: keep it out of the state the
  // container compares, or toggling it would reinstall the runtime.
  const { keepWarm, ...runtimeState } = runtimeRequest;
  const container = getContainer(env.RUNTIME, runtimeRequest.deploymentId);
  context.waitUntil(container.setKeepWarm(keepWarm));
  const startedAt = Date.now();
  const unavailable = await ensureServing(container, env, runtimeState);
  if (unavailable) return unavailable;
  const readyAt = Date.now();
  // Only bodiless reads are safe to send twice.
  const retryable = request.method === "GET" || request.method === "HEAD";
  let response: Response;
  try {
    response = await container.fetch(request);
  } catch (error) {
    // The app stopped since it was last confirmed: check it again, retry once.
    await container.forgetRuntime();
    if (!retryable) throw error;
    const stillUnavailable = await ensureServing(container, env, runtimeState);
    if (stillUnavailable) return stillUnavailable;
    response = await container.fetch(request);
  }
  context.waitUntil(container.flushRuntimeLogs());
  return withTiming(response, readyAt - startedAt, Date.now() - readyAt);
}

/**
 * Server-Timing for every runtime response: how long getting the app ready
 * took, and how long the app took to answer. Feeds Performance, and shows in
 * any browser's network panel.
 */
function withTiming(response: Response, readyMs: number, appMs: number): Response {
  const headers = new Headers(response.headers);
  headers.append("server-timing", `ready;dur=${readyMs}, app;dur=${appMs}`);
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    try {
      return await invoke(request, env, context);
    } catch (error: unknown) {
      // Visitors get a plain answer; the cause goes to the worker log.
      console.error("runtime request failed", error);
      return Response.json(
        { error: "This app couldn't start. Try again in a moment." },
        // Marks the platform's failure, so the edge shows its own page.
        { status: 502, headers: { "x-multivrs-error": "APP_UNAVAILABLE" } },
      );
    }
  },
} satisfies ExportedHandler<Env>;
