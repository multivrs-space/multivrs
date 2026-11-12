import {
  circle,
  createAnimatedIcon,
  group,
  path,
  polyline,
  rect,
} from "@/components/icons/animated/create-animated-icon";

/* Geometry from Lucide (ISC). Motions are ours. */

const ENVELOPE_FLAP = "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7";
const ENVELOPE_OPEN_BODY =
  "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8";

export const LiveMail = createAnimatedIcon("mail", [
  path("m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", {
    motion: "flap",
    origin: "t",
  }),
  rect(2, 4, 20, 16, 2),
]);

export const LiveBookOpen = createAnimatedIcon("book-open", [
  path("M12 7v14", { motion: "draw", delay: 1 }),
  path(
    "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
  ),
]);

export const LiveInbox = createAnimatedIcon("inbox", [
  polyline("22 12 16 12 14 15 10 15 8 12 2 12", { motion: "sink" }),
  path(
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  ),
]);

export const LiveStar = createAnimatedIcon("star", [
  path(
    "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
    { motion: "pop" },
  ),
]);

export const LiveSend = createAnimatedIcon("send", [
  group(
    [
      path(
        "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      ),
      path("m21.854 2.147-10.94 10.939"),
    ],
    { motion: "exit-ne" },
  ),
]);

export const LiveFileText = createAnimatedIcon("file-text", [
  path(
    "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
  ),
  path("M14 2v5a1 1 0 0 0 1 1h5"),
  path("M10 9H8", { motion: "draw" }),
  path("M16 13H8", { motion: "draw", delay: 1 }),
  path("M16 17H8", { motion: "draw", delay: 2 }),
]);

export const LiveArchive = createAnimatedIcon("archive", [
  rect(2, 3, 20, 5, 1, { motion: "lift" }),
  path("M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"),
  path("M10 12h4", { motion: "draw", delay: 2 }),
]);

export const LiveShieldAlert = createAnimatedIcon("shield-alert", [
  path(
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  ),
  path("M12 8v4", { motion: "draw" }),
  path("M12 16h.01", { motion: "blink", delay: 2 }),
]);

export const LiveTrash = createAnimatedIcon("trash-2", [
  group([path("M3 6h18"), path("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")], {
    motion: "lift",
  }),
  path("M10 11v6"),
  path("M14 11v6"),
  path("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"),
]);

export const LiveMailCheck = createAnimatedIcon("mail-check", [
  path(ENVELOPE_OPEN_BODY),
  path(ENVELOPE_FLAP, { motion: "flap", origin: "t" }),
  path("m16 19 2 2 4-4", { motion: "draw", delay: 2 }),
]);

export const LiveMails = createAnimatedIcon("mails", [
  path("M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732", {
    motion: "nudge-l",
    delay: 1,
  }),
  path("m22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5", {
    motion: "flap",
    origin: "t",
  }),
  rect(7, 3, 15, 12, 2),
]);

export const LiveMailQuestion = createAnimatedIcon("mail-question-mark", [
  path("M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5"),
  path(ENVELOPE_FLAP),
  path(
    "M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2",
    { motion: "swing", origin: "b" },
  ),
  path("M20 22v.01", { motion: "blink", delay: 2 }),
]);

export const LiveMailPlus = createAnimatedIcon("mail-plus", [
  path(ENVELOPE_OPEN_BODY),
  path(ENVELOPE_FLAP),
  path("M19 16v6", { motion: "quarter" }),
  path("M16 19h6", { motion: "quarter" }),
]);

export const LiveContactRound = createAnimatedIcon("contact-round", [
  path("M16 2v2", { motion: "sink" }),
  path("M17.915 22a6 6 0 0 0-12 0", { motion: "draw", delay: 1 }),
  path("M8 2v2", { motion: "sink" }),
  circle(12, 12, 4, { motion: "pop" }),
  rect(3, 4, 18, 18, 2),
]);

export const LiveUsersRound = createAnimatedIcon("users-round", [
  path("M18 21a8 8 0 0 0-16 0"),
  circle(10, 8, 5, { motion: "pop" }),
  path("M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3", {
    motion: "nudge-r",
    delay: 1,
  }),
]);
