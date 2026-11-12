"use client";

import type { AnimatedIcon } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: AnimatedIcon;
  /** Show only the icon; the label becomes the accessible name. */
  iconOnly?: boolean;
  /** Small count after the label, e.g. how many projects are failing. */
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}

/**
 * A recessed track with a raised thumb on the chosen option, for local view
 * state (layout, filter). For URL state use SegmentedNav.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  "aria-label": label,
}: SegmentedControlProps<T>) {
  return (
    <fieldset
      className={cn(
        "surface-inset inline-flex h-9 min-w-0 items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            aria-pressed={selected}
            aria-label={option.iconOnly ? option.label : undefined}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-full text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              option.iconOnly ? "w-8 justify-center" : "px-3",
              selected
                ? "surface-raised font-medium text-foreground"
                : "border border-transparent text-muted-foreground hover:text-foreground",
            )}
            data-icon-trigger
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.iconOnly ? option.label : undefined}
            type="button"
          >
            {Icon ? <Icon className="size-3.5" strokeWidth={1.75} /> : null}
            {option.iconOnly ? null : option.label}
            {option.count ? (
              <span className="figure rounded-full bg-foreground/8 px-1.5 text-[10px] leading-4">
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </fieldset>
  );
}
