import {
  circle,
  createAnimatedIcon,
  group,
  path,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

export const LiveBold = createAnimatedIcon("bold", [
  path(
    "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",
    { motion: "squash", origin: "b" },
  ),
]);

export const LiveItalic = createAnimatedIcon("italic", [
  path("M19 4h-9", { motion: "nudge-r" }),
  path("M15 4 9 20"),
  path("M14 20H5", { motion: "nudge-l" }),
]);

export const LiveUnderline = createAnimatedIcon("underline", [
  path("M6 4v6a6 6 0 0 0 12 0V4"),
  path("M4 20h16", { motion: "draw" }),
]);

export const LiveLink = createAnimatedIcon("link-2", [
  path("M9 17H7A5 5 0 0 1 7 7h2", { motion: "nudge-l" }),
  path("M15 7h2a5 5 0 1 1 0 10h-2", { motion: "nudge-r" }),
  path("M8 12h8", { motion: "draw", delay: 1 }),
]);

export const LiveImagePlus = createAnimatedIcon("image-plus", [
  group([path("M16 5h6"), path("M19 2v6")], { motion: "turn", origin: "tr" }),
  path("M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"),
  path("m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", {
    motion: "rise",
    delay: 1,
  }),
  circle(9, 9, 2, { motion: "pop", delay: 2 }),
]);

export const LivePaperclip = createAnimatedIcon("paperclip", [
  path(
    "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
    { motion: "swing", origin: "t" },
  ),
]);

export const LiveX = createAnimatedIcon("x", [
  group([path("M18 6 6 18"), path("m6 6 12 12")], {
    motion: "quarter",
    origin: "c",
  }),
]);

export const LiveMaximize = createAnimatedIcon("maximize-2", [
  group([path("M15 3h6v6"), path("m21 3-7 7")], { motion: "nudge-r" }),
  group([path("m3 21 7-7"), path("M9 21H3v-6")], { motion: "nudge-l" }),
]);

export const LiveMinimize = createAnimatedIcon("minimize-2", [
  group([path("m14 10 7-7"), path("M20 10h-6V4")], { motion: "nudge-l" }),
  group([path("m3 21 7-7"), path("M4 14h6v6")], { motion: "nudge-r" }),
]);
