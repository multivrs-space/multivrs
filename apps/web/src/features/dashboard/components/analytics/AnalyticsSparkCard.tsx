import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DeltaPill } from "@/components/dashboard/DeltaPill";
import type { AnimatedIcon } from "@/components/icons/animated";

interface AnalyticsSparkCardProps {
  title: string;
  icon: AnimatedIcon;
  value: string;
  delta: number | null;
  deltaUnit?: "%" | "pt";
  invert?: boolean;
  series: number[];
  tone?: "primary" | "muted";
}

/** A compact KPI with its trend line, like a ticker tile. */
export function AnalyticsSparkCard({
  title,
  icon,
  value,
  delta,
  deltaUnit,
  invert,
  series,
  tone,
}: AnalyticsSparkCardProps) {
  return (
    <DashCard aria-label={title}>
      <DashCardHeader icon={icon} title={title} />
      <div className="flex items-end justify-between gap-3 px-5 pt-5">
        <p className="figure text-[30px] font-semibold leading-none text-foreground">
          {value}
        </p>
        <DeltaPill invert={invert} unit={deltaUnit} value={delta} />
      </div>
      <Sparkline
        className="mt-3 h-16 w-full"
        label={`${title} trend`}
        tone={tone}
        values={series}
      />
    </DashCard>
  );
}
