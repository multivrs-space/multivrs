import {
  circle,
  createAnimatedIcon,
  group,
  path,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

export const LiveLayoutGrid = createAnimatedIcon("layout-grid", [
  rect(3, 3, 7, 7, 1, { motion: "pop" }),
  rect(14, 3, 7, 7, 1, { motion: "pop", delay: 1 }),
  rect(14, 14, 7, 7, 1, { motion: "pop", delay: 2 }),
  rect(3, 14, 7, 7, 1, { motion: "pop", delay: 3 }),
]);

export const LiveRocket = createAnimatedIcon("rocket", [
  group(
    [
      path("M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"),
      path(
        "M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z",
      ),
      path("M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"),
    ],
    { motion: "launch" },
  ),
  path(
    "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09",
    { motion: "flicker", origin: "tr" },
  ),
]);

export const LiveScrollText = createAnimatedIcon("scroll-text", [
  path("M15 8h-5", { motion: "draw" }),
  path("M15 12h-5", { motion: "draw", delay: 2 }),
  path("M19 17V5a2 2 0 0 0-2-2H4"),
  path(
    "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
  ),
]);

export const LiveActivity = createAnimatedIcon("activity", [
  path(
    "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
    { motion: "draw" },
  ),
]);

export const LiveGauge = createAnimatedIcon("gauge", [
  path("m12 14 4-4", { motion: "swing", origin: "bl" }),
  path("M3.34 19a10 10 0 1 1 17.32 0"),
]);

export const LiveRadar = createAnimatedIcon("radar", [
  path("M19.07 4.93A10 10 0 0 0 6.99 3.34"),
  path("M4 6h.01", { motion: "blink", delay: 2 }),
  path("M2.29 9.62A10 10 0 1 0 21.31 8.35"),
  path("M16.24 7.76A6 6 0 1 0 8.23 16.67"),
  path("M12 18h.01", { motion: "blink" }),
  path("M17.99 11.66A6 6 0 0 1 15.77 16.67"),
  circle(12, 12, 2),
  path("m13.41 10.59 5.66-5.66", { motion: "spin", origin: "icon" }),
]);

export const LiveShieldCheck = createAnimatedIcon("shield-check", [
  path(
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  ),
  path("m9 12 2 2 4-4", { motion: "draw", delay: 1 }),
]);

export const LiveNetwork = createAnimatedIcon("network", [
  rect(9, 2, 6, 6, 1, { motion: "pop" }),
  path("M12 12V8", { motion: "draw", delay: 1 }),
  path("M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", {
    motion: "draw",
    delay: 2,
  }),
  rect(2, 16, 6, 6, 1, { motion: "pop", delay: 3 }),
  rect(16, 16, 6, 6, 1, { motion: "pop", delay: 3 }),
]);

export const LiveKeyRound = createAnimatedIcon("key-round", [
  group(
    [
      path(
        "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      ),
      circle(16.5, 7.5, 0.5, {}, true),
    ],
    { motion: "swing", origin: "tr" },
  ),
]);

export const LivePlugZap = createAnimatedIcon("plug-zap", [
  group(
    [
      path(
        "M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z",
      ),
      path("m2 22 3-3"),
      path("M7.5 13.5 10 11"),
      path("M10.5 16.5 13 14"),
    ],
    { motion: "launch" },
  ),
  path("m18 3-4 4h6l-4 4", { motion: "flicker", delay: 1 }),
]);

export const LiveSquareTerminal = createAnimatedIcon("square-terminal", [
  path("m7 11 2-2-2-2", { motion: "nudge-r" }),
  path("M11 13h4", { motion: "blink", delay: 1 }),
  rect(3, 3, 18, 18, 2),
]);

export const LiveWorkflow = createAnimatedIcon("workflow", [
  rect(3, 3, 8, 8, 2, { motion: "pop" }),
  path("M7 11v4a2 2 0 0 0 2 2h4", { motion: "draw", delay: 1 }),
  rect(13, 13, 8, 8, 2, { motion: "pop", delay: 3 }),
]);

export const LiveGlobe = createAnimatedIcon("globe", [
  circle(12, 12, 10),
  path("M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", { motion: "squash" }),
  path("M2 12h20"),
]);

export const LiveAtSign = createAnimatedIcon("at-sign", [
  circle(12, 12, 4, { motion: "pop", delay: 2 }),
  path("M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", { motion: "draw" }),
]);

export const LiveStore = createAnimatedIcon("store", [
  path("M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5", {
    motion: "rise",
    delay: 1,
  }),
  path(
    "M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",
    { motion: "lift" },
  ),
  path("M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"),
]);

export const LiveSettings = createAnimatedIcon("settings", [
  path(
    "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
    { motion: "turn", origin: "icon" },
  ),
  circle(12, 12, 3),
]);

export const LiveHome = createAnimatedIcon("house", [
  path(
    "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    { motion: "lift" },
  ),
  path("M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", {
    motion: "squash",
    origin: "b",
    delay: 1,
  }),
]);
