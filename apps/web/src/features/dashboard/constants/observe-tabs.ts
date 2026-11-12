import { railSlugFor } from "@/features/dashboard/constants/navigation";

/**
 * Observe sections that share one rail entry, shown as tabs at the top of
 * each: one question per entry, with its views side by side.
 */
const OBSERVE_TAB_GROUPS: Record<
  string,
  readonly { slug: string; label: string }[]
> = {
  analytics: [
    { slug: "analytics", label: "Traffic" },
    { slug: "product", label: "Product" },
  ],
  "speed-insights": [
    { slug: "speed-insights", label: "Real users" },
    { slug: "traces", label: "Traces" },
  ],
  observability: [
    { slug: "observability", label: "Health" },
    { slug: "uptime", label: "Uptime" },
  ],
};

/** The tabs a section sits among, or null when it stands alone. */
export function observeTabsFor(section: string) {
  return OBSERVE_TAB_GROUPS[railSlugFor(section)] ?? null;
}
