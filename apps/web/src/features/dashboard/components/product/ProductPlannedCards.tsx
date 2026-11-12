import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveHistory, LiveListFilter } from "@/components/icons/animated";

const PLANNED = [
  {
    title: "Funnels",
    icon: LiveListFilter,
    line: "Pick events in order, say “Viewed pricing → Started checkout → Paid”, and see how many people reach each step and where they drop off.",
  },
  {
    title: "Retention",
    icon: LiveHistory,
    line: "Group people by the week they first did something and see how many come back to do it again, week after week.",
  },
];

/** The two views that turn events into decisions; described, not faked. */
export function ProductPlannedCards({ className }: { className?: string }) {
  return (
    <div className={className}>
      {PLANNED.map((item) => (
        <DashCard aria-label={item.title} key={item.title}>
          <DashCardHeader
            action={
              <span className="rounded-full border border-dashed border-hairline-strong px-2 py-0.5 text-[10.5px] text-muted-foreground">
                Coming soon
              </span>
            }
            icon={item.icon}
            title={item.title}
          />
          <p className="p-5 pt-3 text-[12.5px] leading-relaxed text-muted-foreground">
            {item.line}
          </p>
        </DashCard>
      ))}
    </div>
  );
}
