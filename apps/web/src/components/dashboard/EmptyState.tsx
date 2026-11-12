import type { ReactNode } from "react";
import type { AnimatedIcon } from "@/components/icons/animated";
import { Object3DSlot } from "@/features/dashboard/three/Object3DSlot";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  glyph: AnimatedIcon;
  title: string;
  description: ReactNode;
  /** Buttons or links, e.g. "Go to docs". */
  actions?: ReactNode;
  className?: string;
}

/**
 * Every "nothing here yet" moment: a live 3D tile of the section's icon, a
 * plain-language line about why, and the next step.
 */
export function EmptyState({
  glyph: Glyph,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden px-6 py-12 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-6 size-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <Object3DSlot
        className="relative size-36"
        label={`${title} illustration`}
        parts={Glyph.parts}
      >
        <Glyph className="size-[42%]" strokeWidth={1.5} />
      </Object3DSlot>
      <h3 className="relative mt-4 text-base font-semibold tracking-[-0.015em] text-foreground">
        {title}
      </h3>
      <div className="relative mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </div>
      {actions ? (
        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
