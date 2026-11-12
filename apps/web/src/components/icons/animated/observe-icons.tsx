import {
  createAnimatedIcon,
  group,
  path,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

/** Error tracking: the legs scramble and the feelers twitch. */
export const LiveBug = createAnimatedIcon("bug", [
  path("m8 2 1.88 1.88", { motion: "wink", origin: "br" }),
  path("M14.12 3.88 16 2", { motion: "wink", origin: "bl", delay: 1 }),
  path("M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"),
  path(
    "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6",
  ),
  path("M12 20v-9"),
  group(
    [
      path("M6.53 9C4.6 8.8 3 7.1 3 5"),
      path("M6 13H2"),
      path("M3 21c0-2.1 1.7-3.9 3.8-4"),
    ],
    { motion: "shake", origin: "r" },
  ),
  group(
    [
      path("M20.97 5c0 2.1-1.6 3.8-3.5 4"),
      path("M22 13h-4"),
      path("M17.2 17c2.1.1 3.8 1.9 3.8 4"),
    ],
    { motion: "shake", origin: "l", delay: 1 },
  ),
]);

/** Uptime: the heartbeat line traces across the heart. */
export const LiveHeartPulse = createAnimatedIcon("heart-pulse", [
  path(
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  ),
  path("M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27", { motion: "draw" }),
]);

/** Product analytics: the pointer taps and the click rays flash. */
export const LivePointerClick = createAnimatedIcon("mouse-pointer-click", [
  path("M14 4.1 12 6", { motion: "blink" }),
  path("m5.1 8-2.9-.8", { motion: "blink", delay: 1 }),
  path("m6 12-1.9 2", { motion: "blink", delay: 2 }),
  path("M7.2 2.2 8 5.1", { motion: "blink", delay: 1 }),
  path(
    "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
    { motion: "nudge-l", origin: "tl" },
  ),
]);

/** Tracing: each span grows out along the timeline. */
export const LiveGantt = createAnimatedIcon("chart-gantt", [
  path("M3 3v16a2 2 0 0 0 2 2h16"),
  path("M10 6h8", { motion: "grow", origin: "l" }),
  path("M8 11h7", { motion: "grow", origin: "l", delay: 1 }),
  path("M12 16h6", { motion: "grow", origin: "l", delay: 2 }),
]);
