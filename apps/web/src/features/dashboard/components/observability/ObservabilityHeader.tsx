import { SegmentedNav } from "@/components/dashboard/SegmentedNav";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";

interface ObservabilityHeaderProps {
  projectName: string;
  title: string;
  description: string;
  view: string;
  range?: AnalyticsRange;
  plusEnabled: boolean;
  /** Hide the range control for views without a time series. */
  showRange?: boolean;
}

/** Shared title block for every Monitoring view. */
export function ObservabilityHeader({
  projectName,
  title,
  description,
  view,
  range,
  plusEnabled,
  showRange = true,
}: ObservabilityHeaderProps) {
  return (
    <DashboardPageHeader
      actions={
        <>
          <StatusOrb label="Production" pill tone="ready" />
          {showRange ? (
            <SegmentedNav
              aria-label="Time range"
              items={(["24h", "7d", "30d"] as const).map((item) => ({
                label: item,
                href: `?view=${view}&range=${item}`,
                active: range === item,
                locked: item === "30d" && !plusEnabled,
              }))}
            />
          ) : null}
        </>
      }
      description={description}
      eyebrow={`${projectName} · Monitoring`}
      title={title}
    />
  );
}
