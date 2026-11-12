"use client";

import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveHistory } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

/** An optional send time beside the send button; mail waits until then. */
export function SendLater({
  onChange,
}: {
  onChange: (scheduled: boolean) => void;
}) {
  return (
    <label
      className="flex items-center gap-2 text-[12px] text-muted-foreground"
      data-icon-trigger
    >
      <LiveHistory className="size-3.5" strokeWidth={1.75} />
      <span className="sr-only sm:not-sr-only">Send later</span>
      <input
        className={cn(DASH_FIELD, "h-8 w-auto border px-2 text-[12px]")}
        name="scheduledAt"
        onChange={(event) => onChange(Boolean(event.target.value))}
        type="datetime-local"
      />
    </label>
  );
}
