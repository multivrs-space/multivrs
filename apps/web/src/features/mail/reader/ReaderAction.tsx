"use client";

import type { AnimatedIcon } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** An icon button in the reader toolbar, named by a tooltip with its key. */
export function ReaderAction({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
  active,
  className,
}: {
  icon: AnimatedIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  /** Lit state, e.g. a starred conversation. */
  active?: boolean;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn(
            "size-8 rounded-full",
            active && "text-amber-500 [&_svg]:fill-amber-400/80",
            className,
          )}
          data-icon-trigger
          disabled={disabled}
          onClick={onClick}
          size="icon-sm"
          variant="quiet"
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
        {shortcut ? (
          <kbd className="ml-2 rounded border border-hairline px-1 font-geist-mono text-[10px] text-muted-foreground">
            {shortcut}
          </kbd>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
