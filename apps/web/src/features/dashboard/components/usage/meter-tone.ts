import type { MeterTone } from "@/features/dashboard/lib/usage-meters";

/** How full a meter is, in the status colours the dashboard already uses. */
export const TONE_FILL: Record<MeterTone, string> = {
  ok: "bg-primary",
  near: "bg-amber-500",
  over: "bg-rose-500",
};

export const TONE_TEXT: Record<MeterTone, string> = {
  ok: "text-muted-foreground",
  near: "text-amber-700 dark:text-amber-300",
  over: "text-rose-700 dark:text-rose-300",
};

export const TONE_RING = {
  ok: "primary",
  near: "warning",
  over: "danger",
} as const satisfies Record<MeterTone, string>;
