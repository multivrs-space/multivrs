"use client";

import { type ReactNode, useState } from "react";
import {
  type AnimatedIcon,
  LiveMaximize,
  LiveMinimize,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useResponsiveSheetSide } from "@/features/domains/use-responsive-sheet-side";
import { cn } from "@/lib/utils";

const EXPANDED = {
  bottom: "1rem",
  left: "1rem",
  right: "1rem",
  maxWidth: "none",
  width: "auto",
};

interface MailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: AnimatedIcon;
  title: string;
  description: string;
  children: ReactNode;
}

/** A side sheet (a bottom sheet on phones) that can grow to fill the window. */
export function MailSheet({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  children,
}: MailSheetProps) {
  const side = useResponsiveSheetSide();
  const [expanded, setExpanded] = useState(false);
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          "dashboard-surface flex w-full flex-col gap-0 border-hairline bg-ink p-0 font-hanken transition-[max-width] duration-200 sm:max-w-xl",
          expanded && "sm:max-w-[min(92vw,1100px)]",
          side === "bottom" && "max-h-[calc(100dvh-2rem)] rounded-t-[22px]",
        )}
        side={side}
        style={
          expanded
            ? side === "bottom"
              ? {
                  ...EXPANDED,
                  height: "calc(100dvh - 2rem)",
                  maxHeight: "none",
                }
              : { ...EXPANDED, top: "1rem", height: "auto" }
            : undefined
        }
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-hairline px-5 py-4 pr-24">
          <span
            className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground"
            data-icon-trigger
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <SheetTitle className="text-[15px] font-semibold tracking-[-0.015em]">
              {title}
            </SheetTitle>
            <SheetDescription className="text-[12px]">
              {description}
            </SheetDescription>
          </div>
          <Button
            aria-label={expanded ? "Restore size" : "Expand"}
            className="absolute right-12 top-1/2 size-8 -translate-y-1/2 rounded-full"
            data-icon-trigger
            onClick={() => setExpanded((value) => !value)}
            size="icon-sm"
            type="button"
            variant="quiet"
          >
            {expanded ? (
              <LiveMinimize strokeWidth={1.75} />
            ) : (
              <LiveMaximize strokeWidth={1.75} />
            )}
          </Button>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
