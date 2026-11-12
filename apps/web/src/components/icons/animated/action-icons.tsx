import {
  circle,
  createAnimatedIcon,
  group,
  path,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

export const LiveArrowUpRight = createAnimatedIcon("arrow-up-right", [
  group([path("M7 7h10v10"), path("M7 17 17 7")], { motion: "exit-ne" }),
]);

export const LiveArrowLeft = createAnimatedIcon("arrow-left", [
  group([path("m12 19-7-7 7-7"), path("M19 12H5")], { motion: "exit-w" }),
]);

export const LiveCopy = createAnimatedIcon("copy", [
  rect(8, 8, 14, 14, 2),
  path("M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", {
    motion: "launch",
  }),
]);

export const LiveRefresh = createAnimatedIcon("refresh-cw", [
  group(
    [
      path("M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"),
      path("M21 3v5h-5"),
      path("M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"),
      path("M8 16H3v5"),
    ],
    { motion: "half", origin: "icon" },
  ),
]);

export const LiveSearch = createAnimatedIcon("search", [
  path("m21 21-4.34-4.34", { motion: "draw", delay: 1 }),
  circle(11, 11, 8, { motion: "pop" }),
]);

export const LiveBell = createAnimatedIcon("bell", [
  path("M10.268 21a2 2 0 0 0 3.464 0", { motion: "nudge-r", delay: 1 }),
  path(
    "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
    { motion: "swing", origin: "t" },
  ),
]);

export const LivePlus = createAnimatedIcon("plus", [
  path("M5 12h14", { motion: "quarter" }),
  path("M12 5v14", { motion: "quarter" }),
]);

export const LiveListFilter = createAnimatedIcon("list-filter", [
  path("M2 5h20"),
  path("M6 12h12", { motion: "nudge-r" }),
  path("M9 19h6", { motion: "nudge-l", delay: 1 }),
]);

export const LiveCalendarDays = createAnimatedIcon("calendar-days", [
  path("M8 2v4", { motion: "sink" }),
  path("M16 2v4", { motion: "sink", delay: 1 }),
  rect(3, 4, 18, 18, 2),
  path("M3 10h18"),
  path("M8 14h.01", { motion: "pop" }),
  path("M12 14h.01", { motion: "pop", delay: 1 }),
  path("M16 14h.01", { motion: "pop", delay: 2 }),
  path("M8 18h.01", { motion: "pop", delay: 1 }),
  path("M12 18h.01", { motion: "pop", delay: 2 }),
  path("M16 18h.01", { motion: "pop", delay: 3 }),
]);

export const LivePanelLeft = createAnimatedIcon("panel-left", [
  rect(3, 3, 18, 18, 2),
  path("M9 3v18", { motion: "nudge-l" }),
]);

export const LiveSun = createAnimatedIcon("sun", [
  circle(12, 12, 4, { motion: "pop" }),
  group(
    [
      path("M12 2v2"),
      path("M12 20v2"),
      path("m4.93 4.93 1.41 1.41"),
      path("m17.66 17.66 1.41 1.41"),
      path("M2 12h2"),
      path("M20 12h2"),
      path("m6.34 17.66-1.41 1.41"),
      path("m19.07 4.93-1.41 1.41"),
    ],
    { motion: "turn", origin: "icon" },
  ),
]);

export const LiveMoon = createAnimatedIcon("moon", [
  path(
    "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
    { motion: "swing", origin: "c" },
  ),
]);

export const LiveHelp = createAnimatedIcon("circle-question-mark", [
  circle(12, 12, 10),
  path("M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", {
    motion: "swing",
    origin: "b",
  }),
  path("M12 17h.01", { motion: "blink", delay: 2 }),
]);

export const LiveLock = createAnimatedIcon("lock-keyhole", [
  circle(12, 16, 1, { motion: "pop", delay: 2 }),
  rect(3, 10, 18, 12, 2),
  path("M7 10V7a5 5 0 0 1 10 0v3", { motion: "lift" }),
]);

export const LiveZap = createAnimatedIcon("zap", [
  path(
    "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
    { motion: "flicker" },
  ),
]);

export const LiveList = createAnimatedIcon("list", [
  path("M3 5h.01", { motion: "pop" }),
  path("M3 12h.01", { motion: "pop", delay: 1 }),
  path("M3 19h.01", { motion: "pop", delay: 2 }),
  path("M8 5h13", { motion: "draw" }),
  path("M8 12h13", { motion: "draw", delay: 1 }),
  path("M8 19h13", { motion: "draw", delay: 2 }),
]);

export const LiveEllipsis = createAnimatedIcon("ellipsis", [
  circle(5, 12, 1, { motion: "rise" }),
  circle(12, 12, 1, { motion: "rise", delay: 1 }),
  circle(19, 12, 1, { motion: "rise", delay: 2 }),
]);

export const LiveChevronLeft = createAnimatedIcon("chevron-left", [
  path("m15 18-6-6 6-6", { motion: "nudge-l" }),
]);

export const LiveChevronRight = createAnimatedIcon("chevron-right", [
  path("m9 18 6-6-6-6", { motion: "nudge-r" }),
]);

export const LiveChevronDown = createAnimatedIcon("chevron-down", [
  path("m6 9 6 6 6-6", { motion: "sink" }),
]);

export const LiveReply = createAnimatedIcon("reply", [
  path("M20 18v-2a4 4 0 0 0-4-4H4"),
  path("m9 17-5-5 5-5", { motion: "nudge-l" }),
]);

export const LiveForward = createAnimatedIcon("forward", [
  path("M4 18v-2a4 4 0 0 1 4-4h12"),
  path("m15 17 5-5-5-5", { motion: "nudge-r" }),
]);

export const LivePrinter = createAnimatedIcon("printer", [
  path(
    "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
  ),
  path("M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", { motion: "sink" }),
  rect(6, 14, 12, 8, 1, { motion: "rise", delay: 1 }),
]);

export const LiveMailOpen = createAnimatedIcon("mail-open", [
  path(
    "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z",
  ),
  path("m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10", {
    motion: "flap",
    origin: "t",
  }),
]);

export const LiveDownload = createAnimatedIcon("download", [
  path("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"),
  group([path("M12 15V3"), path("m7 10 5 5 5-5")], { motion: "sink" }),
]);
