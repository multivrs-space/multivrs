/**
 * Control-plane API: /api/projects/[id]/deployments/[deploymentId]/redeploy
 *   POST → build that deployment's branch again, to the same target
 */
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { redeploy } from "@/lib/services/deployment-start.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    return ok(
      await redeploy(userId, id, deploymentId, new URL(request.url).origin),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
