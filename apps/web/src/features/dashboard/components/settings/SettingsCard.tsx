import type { ReactNode } from "react";
import type { AnimatedIcon } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

/**
 * The stacked settings card: a raised panel per setting, its explanation on
 * top, the control in the middle and a footer with the hint and the action.
 */
export function SettingsCard({
  children,
  className,
  danger,
  id,
}: {
  children: ReactNode;
  className?: string;
  danger?: boolean;
  id?: string;
}) {
  return (
    <section
      className={cn(
        "surface-card scroll-mt-20 overflow-hidden rounded-card",
        danger && "ring-1 ring-rose-500/25 ring-inset",
        className,
      )}
      data-dash-card
      id={id}
    >
      {children}
    </section>
  );
}

interface SettingsCardBodyProps {
  title?: string;
  description?: ReactNode;
  /** A living icon in a well beside the title. */
  icon?: AnimatedIcon;
  children?: ReactNode;
  className?: string;
  badge?: ReactNode;
  aside?: ReactNode;
}

export function SettingsCardBody({
  title,
  description,
  icon: Icon,
  children,
  className,
  badge,
  aside,
}: SettingsCardBodyProps) {
  const hasHeader = Boolean(title || description || aside);
  return (
    <div className={cn("p-5 sm:p-6", className)}>
      {hasHeader ? (
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 gap-3">
            {Icon ? (
              <span
                className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground"
                data-card-icon
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15.5px] font-semibold tracking-[-0.015em] text-foreground">
                    {title}
                  </h2>
                  {badge}
                </div>
              ) : null}
              {description ? (
                <div className="mt-1 max-w-2xl whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      ) : null}
      {children ? (
        <div
          className={cn(hasHeader && "mt-5", Icon && hasHeader && "sm:pl-12")}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsCardFooter({
  helperText,
  action,
  className,
  danger,
}: {
  helperText?: ReactNode;
  action?: ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 border-t px-5 py-3 text-[12.5px] sm:flex-row sm:items-center sm:px-6",
        danger
          ? "border-rose-500/20 bg-rose-500/[0.04] text-rose-700 dark:text-rose-300"
          : "border-hairline bg-foreground/[0.02] text-muted-foreground",
        className,
      )}
    >
      <div className="min-w-0">{helperText}</div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}

/** A small "Planned" style badge for a card's title row. */
export function SettingsBadge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-geist-mono text-[10px] uppercase tracking-[0.12em]",
        tone === "primary"
          ? "bg-primary/10 text-primary"
          : "border border-hairline text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
