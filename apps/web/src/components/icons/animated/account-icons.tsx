import {
  circle,
  createAnimatedIcon,
  group,
  path,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

export const LiveCreditCard = createAnimatedIcon("credit-card", [
  rect(2, 5, 20, 14, 2),
  path("M2 10h20", { motion: "draw" }),
  path("M6 15h4", { motion: "draw", delay: 2 }),
]);

export const LiveReceipt = createAnimatedIcon("receipt-text", [
  path("M14 8H8", { motion: "draw" }),
  path("M16 12H8", { motion: "draw", delay: 1 }),
  path("M13 16H8", { motion: "draw", delay: 2 }),
  path(
    "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",
  ),
]);

export const LiveUsers = createAnimatedIcon("users", [
  path("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"),
  circle(9, 7, 4, { motion: "pop" }),
  group(
    [path("M16 3.128a4 4 0 0 1 0 7.744"), path("M22 21v-2a4 4 0 0 0-3-3.87")],
    { motion: "nudge-r", delay: 1 },
  ),
]);

export const LiveUserRound = createAnimatedIcon("user-round", [
  circle(12, 8, 5, { motion: "pop" }),
  path("M20 21a8 8 0 0 0-16 0", { motion: "draw", delay: 1 }),
]);

export const LiveLifeBuoy = createAnimatedIcon("life-buoy", [
  circle(12, 12, 10),
  group(
    [
      path("m4.93 4.93 4.24 4.24"),
      path("m14.83 9.17 4.24-4.24"),
      path("m14.83 14.83 4.24 4.24"),
      path("m9.17 14.83-4.24 4.24"),
    ],
    { motion: "quarter", origin: "icon" },
  ),
  circle(12, 12, 4),
]);

export const LiveLogOut = createAnimatedIcon("log-out", [
  group([path("m16 17 5-5-5-5"), path("M21 12H9")], { motion: "nudge-r" }),
  path("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"),
]);

export const LiveGitBranch = createAnimatedIcon("git-branch", [
  path("M15 6a9 9 0 0 0-9 9V3", { motion: "draw" }),
  circle(18, 6, 3, { motion: "pop", delay: 2 }),
  circle(6, 18, 3, { motion: "pop", delay: 1 }),
]);

export const LiveHistory = createAnimatedIcon("history", [
  group(
    [
      path("M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"),
      path("M3 3v5h5"),
    ],
    { motion: "swing", origin: "icon" },
  ),
  path("M12 7v5l4 2", { motion: "draw", delay: 1 }),
]);

export const LiveMonitor = createAnimatedIcon("monitor", [
  rect(2, 3, 20, 14, 2, { motion: "blink" }),
  path("M8 21h8"),
  path("M12 17v4", { motion: "grow", origin: "t" }),
]);

export const LiveSmartphone = createAnimatedIcon("smartphone", [
  group([rect(5, 2, 14, 20, 2), path("M12 18h.01")], {
    motion: "shake",
    origin: "c",
  }),
]);

export const LiveFingerprint = createAnimatedIcon("fingerprint", [
  path("M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4", { motion: "draw" }),
  path("M14 13.12c0 2.38 0 6.38-1 8.88", { motion: "draw", delay: 1 }),
  path("M17.29 21.02c.12-.6.43-2.3.5-3.02", { motion: "draw", delay: 2 }),
  path("M2 12a10 10 0 0 1 18-6", { motion: "draw", delay: 1 }),
  path("M2 16h.01"),
  path("M21.8 16c.2-2 .131-5.354 0-6", { motion: "draw", delay: 3 }),
  path("M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2", {
    motion: "draw",
    delay: 2,
  }),
  path("M8.65 22c.21-.66.45-1.32.57-2", { motion: "draw", delay: 3 }),
  path("M9 6.8a6 6 0 0 1 9 5.2v2", { motion: "draw", delay: 4 }),
]);
