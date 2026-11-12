/**
 * Control-plane API: /api/projects/[id]/deployments
 *   GET  → list a project's deployments (newest first)
 *   POST → queue a new deployment
 */
import { createDeploymentInputSchema } from "@multivrs/client";
import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { listDeployments } from "@/lib/services/deployment.service";
import { startDeployment } from "@/lib/services/deployment-start.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return ok(await listDeployments(userId, id));
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const input = await parseBody(req, createDeploymentInputSchema);
    const deployment = await startDeployment(
      userId,
      id,
      input,
      new URL(req.url).origin,
    );
    return ok(deployment, 201);
  } catch (err) {
    return fail(err);
  }
}
