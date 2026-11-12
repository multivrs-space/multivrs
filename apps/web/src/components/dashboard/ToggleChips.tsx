"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToggleChip<T extends string> {
  value: T;
  label: string;
}

interface ToggleChipsProps<T extends string> {
  options: ToggleChip<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  label: string;
  className?: string;
}

/** Several independent on/off choices, such as which environments get a value. */
export function ToggleChips<T extends string>({
  options,
  selected,
  onToggle,
  label,
  className,
}: ToggleChipsProps<T>) {
  return (
    <fieldset className={cn("flex min-w-0 flex-wrap gap-1.5", className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const on = selected.includes(option.value);
        return (
          <button
            aria-pressed={on}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              on
                ? "surface-raised text-foreground"
                : "border border-hairline text-muted-foreground hover:text-foreground",
            )}
            key={option.value}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            <span
              className={cn(
                "grid size-3.5 place-items-center rounded-[4px] border",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline-strong",
              )}
            >
              {on ? <Check className="size-2.5" strokeWidth={3} /> : null}
            </span>
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
