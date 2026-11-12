import { type BuildJob, buildJobSchema } from "@multivrs/client";
import { z } from "zod";
import { hasValidWorkerToken } from "./auth";
import { executeBuild } from "./build";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog, markBuildFailed, revokeBuildToken } from "./control-plane";
import { captureDeploymentPreview } from "./preview-capture";
import { handleSandboxRequest } from "./sandboxes";
import { warmBuilderId } from "./warm-builder-id";
import { wakeSandbox } from "./warm-sandbox";

export { Sandbox } from "@cloudflare/sandbox";

const previewRequestSchema = z.object({
  deploymentId: z.string().regex(/^[a-z0-9][a-z0-9-_]{0,62}$/),
  url: z.url().refine((value) => value.startsWith("https://")),
});

async function enqueue(request: Request, env: BuildWorkerEnv) {
  if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = buildJobSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid build job", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  await env.BUILD_QUEUE.send(parsed.data, { contentType: "json" });
  return Response.json({ accepted: true, deploymentId: parsed.data.deploymentId }, { status: 202 });
}

/** Boot an account's build machine before its build arrives. */
async function warm(request: Request, env: BuildWorkerEnv, context: ExecutionContext) {
  if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: unknown = await request.json().catch(() => null);
  const accountId = body && typeof body === "object" && "accountId" in body ? body.accountId : null;
  if (typeof accountId !== "string" || !accountId || accountId.length > 200) {
    return Response.json({ error: "Invalid warm request" }, { status: 400 });
  }
  const id = await warmBuilderId({ accountId, projectId: "" });
  context.waitUntil(wakeSandbox(env, id));
  return Response.json({ warming: true }, { status: 202 });
}

/** Screenshot a deployment that is already live (one built before captures existed). */
async function preview(request: Request, env: BuildWorkerEnv, context: ExecutionContext) {
  if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = previewRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid preview request" }, { status: 400 });
  context.waitUntil(captureDeploymentPreview(env, parsed.data.deploymentId, parsed.data.url));
  return Response.json({ capturing: true }, { status: 202 });
}

async function consume(message: Message<BuildJob>, env: BuildWorkerEnv) {
  const parsed = buildJobSchema.safeParse(message.body);
  if (!parsed.success) {
    message.ack();
    return;
  }
  const job = parsed.data;
  try {
    await executeBuild(job, env);
    await revokeBuildToken(job);
    message.ack();
  } catch (error) {
    const isBuildError = error instanceof BuildCommandError;
    if (!isBuildError) console.error("build infrastructure error", error);
    // Infrastructure errors are provider-specific; users see a neutral message.
    const messageText = isBuildError
      ? error.message
      : "The build environment failed to start. Retry the deployment.";
    if (!isBuildError && message.attempts < 3) {
      await appendBuildLog(job, "warn", "Build infrastructure interrupted; retrying").catch(
        () => undefined,
      );
      message.retry({ delaySeconds: 30 * message.attempts });
      return;
    }
    await appendBuildLog(job, "error", messageText).catch(() => undefined);
    await markBuildFailed(job, messageText).catch(() => undefined);
    await revokeBuildToken(job).catch(() => undefined);
    message.ack();
  }
}

export default {
  async fetch(request: Request, env: BuildWorkerEnv, context: ExecutionContext) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "multivrs-build" });
    }
    if (request.method === "POST" && url.pathname === "/jobs") {
      return enqueue(request, env);
    }
    if (request.method === "POST" && url.pathname === "/previews") {
      return preview(request, env, context);
    }
    if (request.method === "POST" && url.pathname === "/warm") {
      return warm(request, env, context);
    }
    if (url.pathname.startsWith("/sandboxes")) {
      if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return (
        (await handleSandboxRequest(request, env, url.pathname)) ??
        new Response("Not found", { status: 404 })
      );
    }
    return new Response("Not found", { status: 404 });
  },
  async queue(batch: MessageBatch<BuildJob>, env: BuildWorkerEnv) {
    await Promise.all(batch.messages.map((message) => consume(message, env)));
  },
} satisfies ExportedHandler<BuildWorkerEnv, BuildJob>;
