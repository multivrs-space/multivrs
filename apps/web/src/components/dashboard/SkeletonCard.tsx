import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Loading stand-ins that share the real cards' shapes, so content replaces
 * them without anything moving.
 */
export function SkeletonCard({
  className,
  children,
  icon = true,
}: {
  className?: string;
  children?: ReactNode;
  /** Show the header icon well, as DashCardHeader does. */
  icon?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "surface-card flex flex-col overflow-hidden rounded-card",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 p-5 pb-0">
        {icon ? <span className="skeleton size-8 rounded-[9px]" /> : null}
        <span className="skeleton h-3.5 w-28" />
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

export function SkeletonHeader({
  eyebrow = true,
  action,
}: {
  eyebrow?: boolean;
  /** Width class for the right-hand control, e.g. "w-40"; omit for none. */
  action?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow ? <span className="skeleton mb-2.5 block h-2.5 w-36" /> : null}
        <span className="skeleton block h-8 w-64 max-w-full" />
      </div>
      {action ? (
        <span className={cn("skeleton h-9 rounded-full", action)} />
      ) : null}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => index).map((row) => (
        <div className="flex items-center gap-3" key={row}>
          <span className="skeleton h-3 flex-1" />
          <span className="skeleton h-3 w-12" />
          <span className="skeleton h-2 w-24" />
        </div>
      ))}
    </div>
  );
}
