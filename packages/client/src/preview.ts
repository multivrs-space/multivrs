import { runtimeOriginKey } from "./runtime-worker";

/**
 * Deploy-time screenshots. After a deployment goes live, the build worker
 * opens it in a headless browser and stores one image for the dashboard. The
 * browser sends a header signed for that deployment, so the serve Worker
 * serves it normally but never counts it as traffic or bills it.
 */

export const PREVIEW_HEADER = "x-multivrs-preview";
/** Where a deployment's screenshot lives in the artifacts bucket. */
export const previewObjectKey = (deploymentId: string) => `previews/${deploymentId}.jpg`;

/** Signed per deployment; distinct from the runtime origin key it can read. */
export function previewToken(secret: string, deploymentId: string): Promise<string> {
  return runtimeOriginKey(secret, `preview:${deploymentId}`);
}
