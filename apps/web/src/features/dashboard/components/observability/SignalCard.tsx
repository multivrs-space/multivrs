import { CardAction } from "@/components/dashboard/CardAction";
import { Sparkline } from "@/components/dashboard/charts/Sparkline";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import type { AnimatedIcon } from "@/components/icons/animated";

interface SignalCardProps {
  title: string;
  metric: string;
  icon: AnimatedIcon;
  value: string;
  series: number[];
  /** The view with this signal in full. */
  href: string;
  tone?: "primary" | "muted";
}

/** One live signal: its current total, its shape over the range, a way in. */
export function SignalCard({
  title,
  metric,
  icon,
  value,
  series,
  href,
  tone,
}: SignalCardProps) {
  return (
    <DashCard aria-label={title}>
      <DashCardHeader
        action={
          <CardAction href={href} label={`Open ${title.toLowerCase()}`} />
        }
        description={metric}
        icon={icon}
        title={title}
      />
      <p className="figure px-5 pt-4 text-[30px] font-semibold leading-none">
        {value}
      </p>
      <Sparkline
        className="mt-3 h-24 w-full"
        label={`${title} over time`}
        tone={tone}
        values={series}
      />
    </DashCard>
  );
}
