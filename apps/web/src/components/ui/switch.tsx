"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "default";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      size = "default",
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) {
        setUncontrolledChecked(next);
      }
      onCheckedChange?.(next);
      props.onClick?.(e);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const next = !isChecked;
        if (!isControlled) {
          setUncontrolledChecked(next);
        }
        onCheckedChange?.(next);
      }
      props.onKeyDown?.(e);
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "h-4 w-7" : "h-5 w-9",
          isChecked ? "bg-primary" : "bg-zinc-800 hover:bg-zinc-700",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full shadow-xs ring-0 transition-transform duration-200 ease-in-out",
            size === "sm" ? "h-3 w-3" : "h-4 w-4",
            isChecked
              ? size === "sm"
                ? "translate-x-3 bg-primary-foreground"
                : "translate-x-4 bg-primary-foreground"
              : "translate-x-0 bg-zinc-400",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
