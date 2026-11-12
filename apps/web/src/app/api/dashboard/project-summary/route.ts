import { NotFoundError } from "@multivrs/error-utils";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { projectNavSummary } from "@/lib/services/project-summary.service";

const querySchema = z.object({
  account: z.string().min(1).max(100),
  project: z.string().min(1).max(100),
});

/** The project sidebar's header and counts, at /api/dashboard/project-summary. */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const query = querySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const summary = await projectNavSummary(
      userId,
      query.account,
      query.project,
    );
    if (!summary) throw new NotFoundError("Project not found");
    return ok(summary);
  } catch (error) {
    return fail(error);
  }
}
