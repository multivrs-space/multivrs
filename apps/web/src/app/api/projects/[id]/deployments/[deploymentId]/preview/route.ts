import { NotFoundError } from "@multivrs/error-utils";
import { fail } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createArtifactStore } from "@/lib/artifacts/store";
import { getDeployment } from "@/lib/services/deployment.service";
import { requestPreviewCapture } from "@/lib/services/preview-capture.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

/** The screenshot taken when this deployment went live. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const deployment = await getDeployment(userId, id, deploymentId);
    const image = await createArtifactStore().getPreview(deploymentId);
    if (!image) {
      // Live but never captured: have one taken for next time.
      if (deployment.status === "ready" && deployment.url) {
        requestPreviewCapture(deploymentId, deployment.url);
      }
      throw new NotFoundError("No preview for this deployment");
    }
    return new Response(Buffer.from(image), {
      headers: {
        "cache-control": "private, max-age=86400, immutable",
        "content-type": "image/jpeg",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
