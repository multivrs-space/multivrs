import "server-only";
import { cache } from "react";
import type {
  DeployStats,
  TrafficHeat,
} from "@/features/dashboard/types/overview.types";
import { prisma } from "@/lib/prisma";
import {
  analyticsConfigured,
  DATASET,
  number,
  queryAnalytics,
  sqlProjectId,
} from "@/lib/services/analytics-engine";
import { accountOwnerIdForSlug } from "@/lib/services/dashboard-scope.service";
import { projectAccessWhere } from "@/lib/services/project-access";

const DAY_MS = 86_400_000;

/** Ids of the workspace's projects the viewer may see. */
const visibleProjectIds = cache(
  async (viewerId: string, username: string): Promise<string[]> => {
    const ownerId = await accountOwnerIdForSlug(username);
    if (!ownerId) return [];
    const projects = await prisma.project.findMany({
      where: { ownerId, OR: projectAccessWhere(viewerId) },
      select: { id: true },
    });
    return projects.map((project) => project.id);
  },
);

/** Deploys this week against last week, and the last 30 days by outcome. */
export const workspaceDeployStats = cache(
  async (viewerId: string, username: string): Promise<DeployStats> => {
    const ids = await visibleProjectIds(viewerId, username);
    if (!ids.length)
      return { thisWeek: 0, lastWeek: 0, ready: 0, failed: 0, building: 0 };
    const now = Date.now();
    const scope = { projectId: { in: ids } };
    const [thisWeek, lastWeek, outcomes] = await Promise.all([
      prisma.deployment.count({
        where: { ...scope, createdAt: { gte: new Date(now - 7 * DAY_MS) } },
      }),
      prisma.deployment.count({
        where: {
          ...scope,
          createdAt: {
            gte: new Date(now - 14 * DAY_MS),
            lt: new Date(now - 7 * DAY_MS),
          },
        },
      }),
      prisma.deployment.groupBy({
        by: ["status"],
        where: { ...scope, createdAt: { gte: new Date(now - 30 * DAY_MS) } },
        _count: true,
      }),
    ]);
    const count = (statuses: string[]) =>
      outcomes
        .filter((row) => statuses.includes(row.status))
        .reduce((sum, row) => sum + row._count, 0);
    return {
      thisWeek,
      lastWeek,
      ready: count(["ready"]),
      failed: count(["error", "canceled"]),
      building: count(["queued", "building"]),
    };
  },
);

/** When requests arrive: UTC weekday × hour over 28 days, or null when unmeasured. */
export const workspaceTrafficHeat = cache(
  async (viewerId: string, username: string): Promise<TrafficHeat | null> => {
    if (!analyticsConfigured()) return null;
    const ids = await visibleProjectIds(viewerId, username);
    const cells = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => 0),
    );
    if (!ids.length) return { cells, total: 0 };
    const list = ids.map((id) => `'${sqlProjectId(id)}'`).join(",");
    const filter = `index1 IN (${list}) AND (blob4 = 'request' OR blob4 IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) AND timestamp >= NOW() - INTERVAL '28' DAY`;
    try {
      const rows = await queryAnalytics(
        `SELECT toDayOfWeek(timestamp) dow, toHour(timestamp) hour, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY dow, hour`,
      );
      let total = 0;
      for (const row of rows) {
        const day = cells[number(row, "dow") - 1];
        const hour = number(row, "hour");
        if (!day || hour < 0 || hour > 23) continue;
        day[hour] = number(row, "requests");
        total += day[hour] ?? 0;
      }
      return { cells, total };
    } catch {
      return null;
    }
  },
);
