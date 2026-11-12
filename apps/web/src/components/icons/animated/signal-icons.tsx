import {
  circle,
  createAnimatedIcon,
  group,
  path,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

const DOCUMENT =
  "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z";

export const LiveEarth = createAnimatedIcon("earth", [
  group(
    [
      path("M21.54 15H17a2 2 0 0 0-2 2v4.54"),
      path(
        "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
      ),
      path("M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"),
    ],
    { motion: "drift" },
  ),
  circle(12, 12, 10),
]);

export const LiveFileUp = createAnimatedIcon("file-up", [
  path(DOCUMENT),
  path("M14 2v5a1 1 0 0 0 1 1h5"),
  group([path("M12 12v6"), path("m15 15-3-3-3 3")], { motion: "rise" }),
]);

export const LiveImage = createAnimatedIcon("image", [
  rect(3, 3, 18, 18, 2),
  circle(9, 9, 2, { motion: "rise", delay: 1 }),
  path("m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", { motion: "draw" }),
]);

export const LiveSearchCode = createAnimatedIcon("search-code", [
  path("m13 13.5 2-2.5-2-2.5", { motion: "nudge-r" }),
  path("m21 21-4.3-4.3"),
  path("M9 8.5 7 11l2 2.5", { motion: "nudge-l" }),
  circle(11, 11, 8),
]);

export const LiveBoxes = createAnimatedIcon("boxes", [
  group(
    [
      path(
        "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",
      ),
      path("m7 16.5-4.74-2.85"),
      path("m7 16.5 5-3"),
      path("M7 16.5v5.17"),
    ],
    { motion: "pop", delay: 1 },
  ),
  group(
    [
      path(
        "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",
      ),
      path("m17 16.5-5-3"),
      path("m17 16.5 4.74-2.85"),
      path("M17 16.5v5.17"),
    ],
    { motion: "pop", delay: 2 },
  ),
  group(
    [
      path(
        "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",
      ),
      path("M12 8 7.26 5.15"),
      path("m12 8 4.74-2.85"),
      path("M12 13.5V8"),
    ],
    { motion: "pop" },
  ),
]);

export const LiveSparkles = createAnimatedIcon("sparkles", [
  path(
    "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
    { motion: "twinkle" },
  ),
  group([path("M20 2v4"), path("M22 4h-4")], { motion: "pop", delay: 2 }),
  circle(4, 20, 2, { motion: "pop", delay: 3 }),
]);

export const LiveCloud = createAnimatedIcon("cloud", [
  path("M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", {
    motion: "draw",
  }),
]);
