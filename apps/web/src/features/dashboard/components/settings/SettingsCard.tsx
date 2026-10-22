import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  children: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsCard({ children, className, danger }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card dark:bg-[#000000] transition-colors",
        danger
          ? "border-red-500/30 bg-red-950/5 hover:border-red-500/50"
          : "border-border dark:border-[#262626] hover:border-zinc-400/50 dark:hover:border-[#333333]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SettingsCardBodyProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  badge?: ReactNode;
  aside?: ReactNode;
}

export function SettingsCardBody({
  title,
  description,
  children,
  className,
  badge,
  aside,
}: SettingsCardBodyProps) {
  const hasHeader = Boolean(title || description || aside);
  return (
    <div className={cn("p-6", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            {title && (
              <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
                  {title}
                </h2>
                {badge}
              </div>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground leading-normal whitespace-pre-line">
                {description}
              </p>
            )}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      )}
      {children && <div className={cn(hasHeader && "mt-5")}>{children}</div>}
    </div>
  );
}

interface SettingsCardFooterProps {
  helperText?: ReactNode;
  action?: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsCardFooter({
  helperText,
  action,
  className,
  danger,
}: SettingsCardFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t px-6 py-3.5 text-xs",
        danger
          ? "border-red-500/20 bg-red-950/10 text-red-400"
          : "border-border dark:border-[#262626] bg-muted/40 dark:bg-[#080808] text-muted-foreground",
        className,
      )}
    >
      <div className="min-w-0 text-xs text-muted-foreground">{helperText}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
