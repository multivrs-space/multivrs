"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { LiveSearch, LiveX } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-[13px]",
  lg: "h-11 px-4 text-sm",
} as const;

interface DashboardSearchInputProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "onChange" | "size" | "value"
  > {
  clearable?: boolean;
  containerClassName?: string;
  onValueChange(value: string): void;
  size?: keyof typeof sizeClasses;
  trailing?: ReactNode;
  value: string;
}

export const DashboardSearchInput = forwardRef<
  HTMLInputElement,
  DashboardSearchInputProps
>(function DashboardSearchInput(
  {
    "aria-label": ariaLabel,
    clearable = false,
    containerClassName,
    onValueChange,
    placeholder,
    size = "md",
    trailing,
    value,
    ...inputProps
  },
  ref,
) {
  return (
    <label
      data-icon-trigger
      className={cn(
        "surface-inset flex items-center gap-2 rounded-control transition-shadow focus-within:ring-2 focus-within:ring-ring/60",
        sizeClasses[size],
        containerClassName,
      )}
    >
      <LiveSearch
        className="size-3.5 shrink-0 text-muted-foreground/80"
        strokeWidth={2}
      />
      <input
        {...inputProps}
        ref={ref}
        aria-label={ariaLabel ?? placeholder ?? "Search"}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 appearance-none bg-transparent text-inherit text-foreground caret-primary outline-hidden placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {trailing}
      {clearable && value ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Clear search"
          className="grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          data-icon-trigger
        >
          <LiveX className="size-3.5" strokeWidth={2} />
        </button>
      ) : null}
    </label>
  );
});
