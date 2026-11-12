import Link from "next/link";
import { DashCard } from "@/components/dashboard/DashCard";
import { formatPercent } from "@/components/dashboard/lib/format";
import { LiveArrowUpRight } from "@/components/icons/animated";
import { USAGE_GROUPS } from "@/features/dashboard/components/usage/usage-groups";
import { metersNeedingAttention } from "@/features/dashboard/lib/usage-meters";
import {
  periodDays,
  periodLabels,
} from "@/features/dashboard/lib/usage-period";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { cn } from "@/lib/utils";

const PLAN = {
  hobby: "Hobby",
  pro: "Pro",
  enterprise: "Enterprise",
  unlimited: "Unlimited",
};
const LABELS = new Map(
  USAGE_GROUPS.flatMap((group) =>
    group.rows.map((row) => [row.key, row.label]),
  ),
);
const CHIP =
  "flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-primary-foreground/25 ring-inset";

function verdict(usage: AccountUsage, over: number, near: number): string {
  if (usage.plan === "unlimited")
    return "The Multivrs team account has no limits. Usage is here for reference.";
  if (over)
    return `${over} ${over === 1 ? "meter is" : "meters are"} past what the plan includes.`;
  if (near)
    return `${near} ${near === 1 ? "meter is" : "meters are"} above 75% of the plan.`;
  return usage.plan === "enterprise"
    ? "Everything is within what your contract includes."
    : "Everything is within what your plan includes.";
}

/** The page's purple card: the plan, where we are in the period, what's close. */
export function UsagePlanCard({
  usage,
  username,
  className,
}: {
  usage: AccountUsage;
  username: string;
  className?: string;
}) {
  const days = periodDays(usage.period, Date.parse(usage.measuredAt));
  const dates = periodLabels(usage.period);
  const attention = metersNeedingAttention(usage.meters);
  const over = attention.filter((entry) => entry.share > 1).length;
  return (
    <DashCard
      aria-label="Plan and billing period"
      className={className}
      tone="hero"
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={CHIP}>
            {usage.plan === "unlimited"
              ? "Multivrs team · no limits"
              : `${PLAN[usage.plan]} plan`}
          </span>
          <Link
            className={cn(
              CHIP,
              "transition-colors hover:bg-primary-foreground/25",
            )}
            data-icon-trigger
            href={`/${username}/~/settings#billing`}
          >
            Billing
            <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
        <p className="mt-6 text-[12.5px] opacity-75">
          {dates.start} – {dates.last} · resets {dates.reset}
        </p>
        <p className="figure mt-1.5 text-[40px] font-semibold leading-none tracking-[-0.03em]">
          Day {days.elapsed}
          <span className="text-[20px] font-medium opacity-60">
            {" "}
            of {days.total}
          </span>
        </p>
        <div aria-hidden="true" className="mt-4 flex gap-[3px]">
          {Array.from({ length: days.total }, (_, day) => day).map((day) => (
            <span
              className={cn(
                "h-4 flex-1 rounded-[3px]",
                day < days.elapsed
                  ? "bg-primary-foreground"
                  : "bg-primary-foreground/20",
              )}
              key={day}
            />
          ))}
        </div>
        <p className="mt-auto pt-6 text-[14px] font-medium leading-snug text-balance">
          {verdict(usage, over, attention.length - over)}
        </p>
        {attention.length ? (
          <ul className="mt-3 space-y-2">
            {attention.slice(0, 3).map((entry) => (
              <li
                className="flex items-center gap-3 text-[12px]"
                key={entry.key}
              >
                <span className="w-32 truncate opacity-85">
                  {LABELS.get(entry.key) ?? entry.key}
                </span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-primary-foreground/20">
                  <span
                    className="block h-full rounded-full bg-primary-foreground"
                    style={{ width: `${Math.min(entry.share, 1) * 100}%` }}
                  />
                </span>
                <span className="figure w-10 text-right font-semibold">
                  {formatPercent(Math.min(entry.share * 100, 999), 0)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </DashCard>
  );
}
