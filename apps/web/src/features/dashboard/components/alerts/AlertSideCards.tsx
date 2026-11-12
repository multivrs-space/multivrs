import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  LiveAtSign,
  LiveBell,
  LiveHistory,
  LiveWebhook,
} from "@/components/icons/animated";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type {
  AlertChannel,
  AlertFiring,
} from "@/features/dashboard/types/alert.types";
import { cn } from "@/lib/utils";

const CHANNEL_ICON = {
  email: LiveAtSign,
  webhook: LiveWebhook,
  slack: LiveBell,
};

/** What fired, what it peaked at, and whether it has cleared. */
export function AlertHistory({ firings }: { firings: AlertFiring[] }) {
  return (
    <DashCard aria-label="History">
      <DashCardHeader
        description="Last 7 days"
        icon={LiveHistory}
        title="History"
      />
      <ol className="space-y-1 p-2 pt-3">
        {firings.map((item) => (
          <li
            className="flex gap-3 rounded-tile px-3 py-2.5 hover:bg-foreground/[0.025]"
            key={item.id}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                item.resolvedAt
                  ? "bg-muted-foreground/40"
                  : "animate-pulse bg-rose-500",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">
                {item.rule}
              </span>
              <span className="block truncate text-[11.5px] text-muted-foreground">
                Peaked at {item.value} ·{" "}
                {item.resolvedAt ? "cleared" : "still firing"}
              </span>
            </span>
            <time
              className="shrink-0 font-geist-mono text-[11px] text-muted-foreground"
              dateTime={item.firedAt}
              title={fullTimestamp(item.firedAt)}
            >
              {relativeTime(item.firedAt)}
            </time>
          </li>
        ))}
      </ol>
    </DashCard>
  );
}

/** Where notices go. */
export function AlertChannels({ channels }: { channels: AlertChannel[] }) {
  return (
    <DashCard aria-label="Channels">
      <DashCardHeader icon={LiveWebhook} title="Channels" />
      <ul className="space-y-1 p-2 pt-3">
        {channels.map((channel) => {
          const Icon = CHANNEL_ICON[channel.kind];
          return (
            <li
              className="flex items-center gap-3 rounded-tile px-3 py-2"
              data-icon-trigger
              key={`${channel.kind}-${channel.target}`}
            >
              <Icon
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px]">
                {channel.target}
              </span>
              <span className="text-[11px] capitalize text-muted-foreground">
                {channel.kind}
              </span>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
