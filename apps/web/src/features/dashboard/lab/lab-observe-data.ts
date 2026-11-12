import { groupIssues } from "@/features/dashboard/lib/error-issues";
import type { ProductAnalytics } from "@/features/dashboard/types/product-analytics.types";

/* Synthetic Observe data for tuning designs in the lab only. Product pages
   never render made-up numbers. */
export const LAB_NOW = Date.UTC(2026, 9, 27, 15);
const ago = (minutes: number) =>
  new Date(LAB_NOW - minutes * 60_000).toISOString();
const P1 = "11111111-1111-4111-8111-111111111111";
const P2 = "22222222-2222-4222-8222-222222222222";
const D1 = "1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d";
export const LAB_OBSERVE_PROJECTS: [string, { name: string; href: string }][] =
  [
    [P1, { name: "storefront", href: "/acme/storefront" }],
    [P2, { name: "docs", href: "/acme/docs" }],
  ];

const MESSAGES: [string, number, string][] = [
  [
    "TypeError: Cannot read properties of undefined (reading 'price')\n    at CartLine (app/cart/line.tsx:42:18)",
    64,
    P1,
  ],
  ["Error: payment provider timed out after 10000ms", 23, P1],
  [
    "PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)",
    11,
    P1,
  ],
  [
    "ReferenceError: window is not defined\n    at useTheme (lib/theme.ts:8:3)",
    5,
    P2,
  ],
];
export const LAB_ISSUES = groupIssues(
  MESSAGES.flatMap(([message, count, projectId], kind) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${kind}-${index}`,
      message: message.replace("10000", String(10000 + index)),
      at: ago(kind === 3 ? 30 + index * 40 : index * (kind + 1) * 290),
      projectId,
      deploymentId: D1,
      requestId: `req_${kind}${index}`,
    })),
  ),
  LAB_NOW,
);

const EVENTS: [string, number, number][] = [
  ["Clicked pricing CTA", 3_810, 2_940],
  ["Copied install command", 2_150, 1_320],
  ["Signed up", 1_240, 1_190],
  ["Started checkout", 690, 610],
  ["Invited teammate", 310, 205],
  ["Upgraded to Pro", 142, 141],
];
export const LAB_PRODUCT: ProductAnalytics = {
  state: "ready",
  range: "7d",
  events: EVENTS.reduce((sum, [, events]) => sum + events, 0),
  users: 4_120,
  visitors: 25_100,
  series: Array.from({ length: 7 }, (_, day) => ({
    label: `10-${21 + day}`,
    events: 1_000 + Math.round(320 * Math.sin(day)) + day * 60,
    users: 600 + day * 20,
  })),
  rows: EVENTS.map(([name, events, users], index) => ({
    name,
    events,
    users,
    trend: Array.from({ length: 7 }, (_, day) =>
      Math.round((events / 7) * (0.7 + 0.5 * Math.abs(Math.sin(day + index)))),
    ),
  })),
};
