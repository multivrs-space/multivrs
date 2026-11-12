import {
  circle,
  createAnimatedIcon,
  group,
  path,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

export const LiveBot = createAnimatedIcon("bot", [
  path("M12 8V4H8", { motion: "swing", origin: "br" }),
  rect(4, 8, 16, 12, 2),
  path("M2 14h2"),
  path("M20 14h2"),
  path("M15 13v2", { motion: "wink", delay: 1 }),
  path("M9 13v2", { motion: "wink", delay: 1 }),
]);

export const LiveTags = createAnimatedIcon("tags", [
  group(
    [
      path(
        "M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z",
      ),
      circle(10.5, 6.5, 0.5, {}, true),
    ],
    { motion: "swing", origin: "tl" },
  ),
  path("M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"),
]);

export const LiveWebhook = createAnimatedIcon("webhook", [
  path(
    "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",
    { motion: "draw" },
  ),
  path("m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06", {
    motion: "draw",
    delay: 1,
  }),
  path("m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8", {
    motion: "draw",
    delay: 2,
  }),
]);

export const LiveChartColumn = createAnimatedIcon("chart-column", [
  path("M3 3v16a2 2 0 0 0 2 2h16"),
  path("M8 17v-3", { motion: "grow", origin: "b" }),
  path("M13 17V5", { motion: "grow", origin: "b", delay: 1 }),
  path("M18 17V9", { motion: "grow", origin: "b", delay: 2 }),
]);

export const LiveSliders = createAnimatedIcon("settings-2", [
  path("M14 17H5"),
  path("M19 7h-9"),
  circle(17, 17, 3, { motion: "nudge-l" }),
  circle(7, 7, 3, { motion: "nudge-r" }),
]);

export const LiveNotebookTabs = createAnimatedIcon("notebook-tabs", [
  path("M2 6h4"),
  path("M2 10h4"),
  path("M2 14h4"),
  path("M2 18h4"),
  rect(4, 2, 16, 20, 2),
  path("M15 2v20"),
  path("M15 7h5", { motion: "nudge-r" }),
  path("M15 12h5", { motion: "nudge-r", delay: 1 }),
  path("M15 17h5", { motion: "nudge-r", delay: 2 }),
]);

export const LiveTriangleAlert = createAnimatedIcon("triangle-alert", [
  path(
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    { motion: "shake", origin: "b" },
  ),
  path("M12 9v4", { motion: "draw", delay: 1 }),
  path("M12 17h.01", { motion: "blink", delay: 2 }),
]);

export const LiveSquareFunction = createAnimatedIcon("square-function", [
  rect(3, 3, 18, 18, 2),
  path("M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3", { motion: "draw" }),
  path("M9 11.2h5.7", { motion: "draw", delay: 2 }),
]);

export const LiveScanLine = createAnimatedIcon("scan-line", [
  path("M3 7V5a2 2 0 0 1 2-2h2"),
  path("M17 3h2a2 2 0 0 1 2 2v2"),
  path("M21 17v2a2 2 0 0 1-2 2h-2"),
  path("M7 21H5a2 2 0 0 1-2-2v-2"),
  path("M7 12h10", { motion: "scan" }),
]);

export const LiveSquareM = createAnimatedIcon("square-m", [
  path(
    "M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16",
    { motion: "draw" },
  ),
  rect(3, 3, 18, 18, 2),
]);
