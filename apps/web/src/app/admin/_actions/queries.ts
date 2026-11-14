import "server-only";

import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Read-only aggregations backing the internal admin area. These never mutate
 * anything and only touch identity tables (users, accounts, sessions) — no
 * customer content such as mail or deployments is read here.
 */

export interface AdminOverview {
  totalUsers: number;
  verifiedUsers: number;
  newLast7Days: number;
  newLast30Days: number;
  newPrevious30Days: number;
  activeSessions: number;
  usersWith2fa: number;
  providerCounts: Array<{ provider: string; count: number }>;
  /** Signups per day for the last 30 days, oldest first, zero-filled. */
  trend: Array<{ day: string; count: number }>;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  // The whole overview is relative to "now", so it must render per request.
  // Under cacheComponents the prerender pass still runs even on a blocking
  // (instant = false) route — marking the function request-bound first keeps
  // new Date() out of the prerendered shell.
  await connection();

  const now = new Date();
  const start30 = daysAgo(30);
  const start60 = daysAgo(60);

  const [
    totalUsers,
    verifiedUsers,
    newLast7Days,
    newLast30Days,
    newPrevious30Days,
    activeSessions,
    usersWith2fa,
    providerGroups,
    signupGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.user.count({ where: { createdAt: { gte: start30 } } }),
    prisma.user.count({
      where: { createdAt: { gte: start60, lt: start30 } },
    }),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.user.count({ where: { twoFactorEnabled: true } }),
    prisma.account.groupBy({
      by: ["providerId"],
      _count: { _all: true },
      orderBy: { _count: { providerId: "desc" } },
    }),
    prisma.user.groupBy({
      by: ["createdAt"],
      // Prisma truncates grouped dates to the day here; the zero-fill below
      // makes the series dense regardless of gaps.
      _count: { _all: true },
      where: { createdAt: { gte: start30 } },
    }),
  ]);

  const countsByDay = new Map<string, number>();
  for (const group of signupGroups) {
    const key = group.createdAt.toISOString().slice(0, 10);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + group._count._all);
  }

  const trend: AdminOverview["trend"] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = daysAgo(offset);
    const key = date.toISOString().slice(0, 10);
    trend.push({
      day: key,
      count: countsByDay.get(key) ?? 0,
    });
  }

  return {
    totalUsers,
    verifiedUsers,
    newLast7Days,
    newLast30Days,
    newPrevious30Days,
    activeSessions,
    usersWith2fa,
    providerCounts: providerGroups.map((group) => ({
      provider: group.providerId,
      count: group._count._all,
    })),
    trend,
  };
}

export const USERS_PAGE_SIZE = 10;

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  username: string | null;
  image: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  providers: string[];
  lastSessionAt: Date | null;
}

export interface AdminUserPage {
  rows: AdminUserRow[];
  total: number;
}

/**
 * One page of users for the /admin/users table. `query` matches email, name
 * or username, case-insensitively.
 */
export async function getAdminUsers(
  query: string,
  page: number,
): Promise<AdminUserPage> {
  // Session liveness is checked against Date.now() below, so this read must
  // be request-bound too (same reasoning as getAdminOverview).
  await connection();

  const trimmed = query.trim();
  const where = trimmed
    ? {
        OR: [
          { email: { contains: trimmed, mode: "insensitive" as const } },
          { name: { contains: trimmed, mode: "insensitive" as const } },
          { username: { contains: trimmed, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        accounts: { select: { providerId: true } },
        sessions: { select: { expiresAt: true, createdAt: true } },
      },
    }),
  ]);

  const now = Date.now();

  return {
    total,
    rows: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      providers: [
        ...new Set(user.accounts.map((account) => account.providerId)),
      ],
      lastSessionAt:
        user.sessions
          .filter((session) => session.expiresAt.getTime() > now)
          .reduce<Date | null>(
            (latest, session) =>
              latest === null || session.createdAt > latest
                ? session.createdAt
                : latest,
            null,
          ) ?? null,
    })),
  };
}
