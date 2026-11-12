import { PREVIEW_HEADER, previewToken } from "@multivrs/client/preview";
import type { Env } from "./types";

/**
 * The dashboard's screenshot browser, recognised by a header signed for this
 * deployment. Its requests get an environment with analytics and usage off,
 * and the header is removed before anything reaches the customer's code.
 */
export async function previewCapture(
  request: Request,
  env: Env,
  deploymentId: string,
): Promise<{ request: Request; env: Env } | null> {
  const presented = request.headers.get(PREVIEW_HEADER);
  if (!presented || !env.RUNTIME_ORIGIN_SECRET) return null;
  const expected = await previewToken(env.RUNTIME_ORIGIN_SECRET, deploymentId);
  if (presented !== expected) return null;
  const headers = new Headers(request.headers);
  headers.delete(PREVIEW_HEADER);
  return {
    request: new Request(request, { headers }),
    env: { ...env, ANALYTICS: undefined, USAGE_ANALYTICS: undefined },
  };
}
