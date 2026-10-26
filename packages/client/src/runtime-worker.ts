/**
 * Naming and origin authentication for per-deployment runtime Workers.
 *
 * Without a dispatch namespace, each server-rendered deployment is published as
 * its own Worker in the platform account. The serve Worker reaches it over
 * workers.dev, so the runtime only answers requests carrying a key derived from
 * a platform secret and the deployment id. A deployment can read its own key
 * from its environment, which only unlocks that same deployment.
 */

export const RUNTIME_SCRIPT_PREFIX = "mvd-";
export const RUNTIME_ORIGIN_HEADER = "x-multivrs-origin-key";
export const RUNTIME_ORIGIN_VARIABLE = "MULTIVRS_ORIGIN_KEY";
const MAX_SCRIPT_NAME = 63;

/** Worker script name for a deployment: a valid workers.dev DNS label. */
export function runtimeScriptName(deploymentId: string): string {
  const safe = deploymentId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${RUNTIME_SCRIPT_PREFIX}${safe}`.slice(0, MAX_SCRIPT_NAME).replace(/-+$/, "");
}

/** Hex HMAC-SHA256 of the deployment id under the platform runtime secret. */
export async function runtimeOriginKey(secret: string, deploymentId: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(deploymentId));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
