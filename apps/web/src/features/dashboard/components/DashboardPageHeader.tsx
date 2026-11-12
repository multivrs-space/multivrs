import type { ReactNode } from "react";

interface DashboardPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Small mono label above the title, e.g. the project name. */
  eyebrow?: ReactNode;
  /** Buttons, links or a range control beside the title. */
  actions?: ReactNode;
  /** Shown under the title, such as tabs or status. */
  children?: ReactNode;
}

/**
 * The title block every dashboard page opens with: an optional eyebrow, a
 * large tight title, one line of context, and the page's actions on the right.
 */
export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
}: DashboardPageHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[32px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </header>
  );
}
