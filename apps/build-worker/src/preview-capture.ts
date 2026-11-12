import { type BuildJob, deploymentSchema } from "@multivrs/client";
import { PREVIEW_HEADER, previewObjectKey, previewToken } from "@multivrs/client/preview";
import type { BuildWorkerEnv } from "./build-worker.types";

const VIEWPORT = { width: 1280, height: 800 };

/** The deployment as the control plane sees it now: live or not, and where. */
async function liveDeployment(job: BuildJob) {
  const response = await fetch(
    new URL(`/api/projects/${job.projectId}/deployments/${job.deploymentId}`, job.apiUrl),
    { headers: { authorization: `Bearer ${job.apiToken}` } },
  );
  if (!response.ok) return null;
  return deploymentSchema.parse(await response.json());
}

/** After a build: screenshot the deployment if it went live. */
export async function capturePreview(job: BuildJob, env: BuildWorkerEnv): Promise<boolean> {
  const deployment = await liveDeployment(job).catch(() => null);
  if (deployment?.status !== "ready" || !deployment.url) return false;
  return captureDeploymentPreview(env, job.deploymentId, deployment.url);
}

/**
 * One screenshot of a live deployment for the dashboard's production card.
 * Best effort: a failed capture only means the card shows the site's icon.
 */
export async function captureDeploymentPreview(
  env: BuildWorkerEnv,
  deploymentId: string,
  url: string,
): Promise<boolean> {
  const token = env.BROWSER_RENDERING_API_TOKEN ?? env.CLOUDFLARE_API_TOKEN;
  if (!token || !env.CLOUDFLARE_ACCOUNT_ID || !env.RUNTIME_ORIGIN_SECRET) {
    return false;
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/screenshot`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url,
        viewport: VIEWPORT,
        gotoOptions: { waitUntil: "networkidle2", timeout: 20_000 },
        // Signed for this deployment, so the visit is never counted or billed.
        setExtraHTTPHeaders: {
          [PREVIEW_HEADER]: await previewToken(env.RUNTIME_ORIGIN_SECRET, deploymentId),
        },
        screenshotOptions: { type: "jpeg", quality: 80 },
      }),
      signal: AbortSignal.timeout(45_000),
    },
  ).catch(() => null);
  if (!response?.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    const detail = response ? (await response.text().catch(() => "")).slice(0, 300) : "no response";
    console.error("preview capture failed", response?.status, detail);
    return false;
  }
  await env.ARTIFACTS.put(previewObjectKey(deploymentId), await response.arrayBuffer(), {
    httpMetadata: { contentType: "image/jpeg" },
  });
  return true;
}
