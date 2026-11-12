import type { ReactNode } from "react";
import type { AnimatedIcon } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

interface DashCardProps {
  children: ReactNode;
  className?: string;
  /** `hero` is the one purple card a page may have; `glass` floats over a scene. */
  tone?: "card" | "hero" | "glass";
  "aria-label"?: string;
}

/** The bento tile every dashboard page is built from. */
export function DashCard({
  children,
  className,
  tone = "card",
  ...rest
}: DashCardProps) {
  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-card",
        tone === "hero"
          ? "surface-hero"
          : tone === "glass"
            ? "surface-glass"
            : "surface-card",
        className,
      )}
      data-dash-card
      {...rest}
    >
      {children}
    </section>
  );
}

interface DashCardHeaderProps {
  title: ReactNode;
  icon?: AnimatedIcon;
  /** A brand mark (e.g. GitHub) in the icon well, for cards about a vendor. */
  mark?: ReactNode;
  description?: ReactNode;
  /** Right side: a CardAction, tabs or a select. */
  action?: ReactNode;
  className?: string;
}

export function DashCardHeader({
  title,
  icon: Icon,
  mark,
  description,
  action,
  className,
}: DashCardHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-3 p-5 pb-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon || mark ? (
          <span
            className="surface-inset flex size-8 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground"
            data-card-icon
          >
            {Icon ? <Icon className="size-4" strokeWidth={1.75} /> : mark}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </header>
  );
}

interface DashCardInsightProps {
  icon: AnimatedIcon;
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * The footer note that tells the reader what the card means, e.g. "Most
 * visitors arrive from Nigeria". Always derived from the card's own data.
 */
export function DashCardInsight({
  icon: Icon,
  label,
  children,
  className,
}: DashCardInsightProps) {
  return (
    <div
      className={cn(
        "surface-inset m-2 mt-auto flex items-start gap-2.5 rounded-tile px-3.5 py-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Icon
        className="mt-0.5 size-4 shrink-0 text-primary"
        strokeWidth={1.75}
      />
      <p>
        <span className="font-semibold text-foreground">{label}: </span>
        {children}
      </p>
    </div>
  );
}
