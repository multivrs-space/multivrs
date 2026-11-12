import { z } from "zod";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { getDeployment } from "@/lib/services/deployment.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

const sourceSchema = z.object({
  commitSha: z.string().regex(/^[0-9a-f]{7,40}$/),
});

/** The build reports the commit it checked out; set once, never overwritten. */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const { commitSha } = await parseBody(request, sourceSchema);
    await getDeployment(userId, id, deploymentId);
    await prisma.deployment.updateMany({
      where: { id: deploymentId, commitSha: null },
      data: { commitSha },
    });
    return ok({ commitSha });
  } catch (error) {
    return fail(error);
  }
}
