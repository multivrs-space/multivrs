import type { ReactNode } from "react";
import { SegmentedNav } from "@/components/dashboard/SegmentedNav";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import { observeTabsFor } from "@/features/dashboard/constants/observe-tabs";

/** A section's sibling views as tabs above it, when it has any. */
export function ObserveTabs({
  children,
  scope,
  section,
  username,
}: {
  children: ReactNode;
  scope: string;
  section: string;
  username: string;
}) {
  const tabs = observeTabsFor(section);
  if (!tabs) return children;
  return (
    <>
      <div className="px-4 pt-5 lg:px-6 lg:pt-6">
        <SegmentedNav
          aria-label="Views"
          items={tabs.map((tab) => ({
            label: tab.label,
            href: buildNavHref(username, scope, tab.slug),
            active: tab.slug === section,
          }))}
        />
      </div>
      {children}
    </>
  );
}
