import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatCompact } from "@/components/dashboard/lib/format";
import {
  billingPeriodLabel,
  formatBytes,
  formatDuration,
} from "@/components/dashboard/lib/units";
import {
  type AnimatedIcon,
  LiveCalendarDays,
} from "@/components/icons/animated";
import type { UsageFormat } from "@/features/dashboard/constants/observability-views";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

const FORMATS: Record<UsageFormat, (value: number) => string> = {
  count: formatCompact,
  bytes: formatBytes,
  duration: formatDuration,
};

interface UsageSignalViewProps {
  usage: AccountUsage;
  rows: [label: string, key: string, format: UsageFormat][];
  title: string;
  icon: AnimatedIcon;
}

/**
 * A resource measured by metering rather than per-request telemetry: this
 * billing period's totals for the workspace, clearly labelled as such.
 */
export function UsageSignalView({
  usage,
  rows,
  title,
  icon,
}: UsageSignalViewProps) {
  return (
    <DashCard aria-label={`${title} usage`}>
      <DashCardHeader
        action={
          <span
            className="surface-inset flex h-7 items-center gap-1.5 rounded-full px-2.5 font-geist-mono text-[11px] text-muted-foreground"
            data-icon-trigger
          >
            <LiveCalendarDays className="size-3.5" strokeWidth={1.75} />
            {billingPeriodLabel()}
          </span>
        }
        description="Workspace total for the current billing period"
        icon={icon}
        title={title}
      />
      <dl className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map(([label, key, format]) => (
          <div className="surface-inset rounded-tile p-4" key={key}>
            <dt className="text-[12px] text-muted-foreground">{label}</dt>
            <dd className="figure mt-2 text-[28px] font-semibold leading-none">
              {FORMATS[format](usage.metrics[key] ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="px-5 pb-5 text-xs leading-5 text-muted-foreground">
        Per-project breakdowns and a timeline land here as this resource reports
        per-request telemetry.
      </p>
    </DashCard>
  );
}
