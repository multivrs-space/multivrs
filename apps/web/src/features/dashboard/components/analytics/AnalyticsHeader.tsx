import { SegmentedNav } from "@/components/dashboard/SegmentedNav";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";

interface AnalyticsHeaderProps {
  projectName?: string;
  range?: AnalyticsRange;
  plusEnabled: boolean;
}

const RANGES: AnalyticsRange[] = ["24h", "7d", "30d"];

export function AnalyticsHeader({
  projectName,
  range,
  plusEnabled,
}: AnalyticsHeaderProps) {
  return (
    <DashboardPageHeader
      actions={
        <SegmentedNav
          aria-label="Time range"
          items={RANGES.map((item) => ({
            label: item,
            href: `?range=${item}`,
            active: range === item,
            locked: item === "30d" && !plusEnabled,
          }))}
        />
      }
      eyebrow={`${projectName ? `${projectName} · ` : ""}Web Analytics`}
      title="Audience overview"
    />
  );
}
