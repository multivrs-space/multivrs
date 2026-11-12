import "server-only";
import {
  groupIssues,
  ISSUE_WINDOW_DAYS,
} from "@/features/dashboard/lib/error-issues";
import type { ErrorIssue } from "@/features/dashboard/types/error-issue.types";
import { prisma } from "@/lib/prisma";

const DAY_MS = 86_400_000;

/**
 * Runtime errors from these projects over the last two weeks, grouped into
 * issues. Reads the latest 2,000 error lines, which covers any healthy app.
 */
export async function listErrorIssues(
  projectIds: string[],
): Promise<{ issues: ErrorIssue[]; events: number; truncated: boolean }> {
  if (!projectIds.length) return { issues: [], events: 0, truncated: false };
  const rows = await prisma.deploymentLog.findMany({
    where: {
      level: "error",
      source: "runtime",
      createdAt: { gte: new Date(Date.now() - ISSUE_WINDOW_DAYS * DAY_MS) },
      deployment: { projectId: { in: projectIds } },
    },
    select: {
      id: true,
      message: true,
      createdAt: true,
      deploymentId: true,
      requestId: true,
      deployment: { select: { projectId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 2_000,
  });
  return {
    issues: groupIssues(
      rows.map((row) => ({
        id: row.id,
        message: row.message,
        at: row.createdAt.toISOString(),
        projectId: row.deployment.projectId,
        deploymentId: row.deploymentId,
        requestId: row.requestId,
      })),
    ),
    events: rows.length,
    truncated: rows.length === 2_000,
  };
}
