import {
  type AnimatedIcon,
  LiveKeyRound,
  LiveLayoutGrid,
  LiveLock,
  LiveShieldCheck,
  LiveUserRound,
} from "@/components/icons/animated";
import type {
  ActivityCategory,
  ActivityWindow,
} from "@/features/dashboard/components/account/activity/activity-events";

/** The icon on each timeline node, and the two filter rows above it. */
export const ACTIVITY_ICONS: Record<ActivityCategory, AnimatedIcon> = {
  "sign-in": LiveLock,
  security: LiveShieldCheck,
  tokens: LiveKeyRound,
  projects: LiveLayoutGrid,
  account: LiveUserRound,
};
export const ACTIVITY_KINDS: {
  value: "all" | ActivityCategory;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "sign-in", label: "Sign-in" },
  { value: "security", label: "Security" },
  { value: "tokens", label: "Tokens" },
  { value: "projects", label: "Projects" },
];
export const ACTIVITY_WINDOWS: { value: ActivityWindow; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "30d", label: "30d" },
  { value: "7d", label: "7d" },
  { value: "24h", label: "24h" },
];
