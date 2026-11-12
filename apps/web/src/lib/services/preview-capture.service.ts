import "server-only";

/** Deployments asked about recently, so page views don't queue duplicates. */
const requested = new Map<string, number>();
const RETRY_AFTER_MS = 5 * 60_000;

/**
 * Ask the build service to screenshot a live deployment that has no preview
 * yet (one built before captures existed). Best effort, never awaited by a
 * page: the image appears on a later visit.
 */
export function requestPreviewCapture(deploymentId: string, url: string) {
  const workerUrl = process.env.CLOUDFLARE_BUILD_WORKER_URL;
  const token = process.env.CLOUDFLARE_BUILD_WORKER_TOKEN;
  if (!workerUrl || !token || !url.startsWith("https://")) return;
  const last = requested.get(deploymentId);
  if (last && Date.now() - last < RETRY_AFTER_MS) return;
  requested.set(deploymentId, Date.now());
  void fetch(new URL("/previews", workerUrl), {
    body: JSON.stringify({ deploymentId, url }),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(5_000),
  }).catch(() => undefined);
}
