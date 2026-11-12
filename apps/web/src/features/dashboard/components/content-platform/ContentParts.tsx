"use client";

import type { ReactNode } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { type AnimatedIcon, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Native inputs and selects in the content platform use the field look. */
export const CONTENT_FIELD = cn(DASH_FIELD, "w-full border px-3 outline-none");

export function ContentSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: AnimatedIcon;
  title: string;
}) {
  return (
    <DashCard aria-label={title}>
      <DashCardHeader description={description} icon={icon} title={title} />
      <div className="p-5 pt-4">{children}</div>
    </DashCard>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `children` is the field's input.
    <label className={cn("block space-y-1.5 text-xs font-medium", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Rows({
  children,
  empty,
}: {
  children: ReactNode;
  empty: string;
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);
  return (
    <div className="surface-inset mt-4 divide-y divide-hairline rounded-tile">
      {hasChildren ? (
        children
      ) : (
        <p className="px-3 py-5 text-center text-xs text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  );
}

export function Row({
  primary,
  secondary,
  trailing,
}: {
  primary: string;
  secondary: string;
  trailing: ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-geist-mono text-[12.5px] text-foreground">
          {primary}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
          {secondary}
        </p>
      </div>
      <div className="flex items-center gap-1">{trailing}</div>
    </div>
  );
}

export function DeleteButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      className="size-8"
      data-icon-trigger
      disabled={disabled}
      onClick={onClick}
      size="icon-sm"
      variant="quiet"
    >
      <LiveTrash strokeWidth={1.75} />
    </Button>
  );
}
