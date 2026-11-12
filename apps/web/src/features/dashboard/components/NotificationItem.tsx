import Link from "next/link";
import {
  type AnimatedIcon,
  LiveArchive,
  LiveShieldAlert,
  LiveShieldCheck,
  LiveSparkles,
  LiveTriangleAlert,
} from "@/components/icons/animated";
import {
  fullTimestamp,
  relativeTime,
} from "@/features/dashboard/lib/relative-time";
import type {
  DashboardNotification,
  NotificationType,
} from "@/features/dashboard/types/notification.types";
import { cn } from "@/lib/utils";

const KINDS: Record<NotificationType, { icon: AnimatedIcon; tone: string }> = {
  error: { icon: LiveShieldAlert, tone: "text-rose-600 dark:text-rose-400" },
  warning: {
    icon: LiveTriangleAlert,
    tone: "text-amber-600 dark:text-amber-400",
  },
  success: {
    icon: LiveShieldCheck,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  info: { icon: LiveSparkles, tone: "text-primary" },
};

function NotificationContent({ item }: { item: DashboardNotification }) {
  const { icon: Icon, tone } = KINDS[item.type];
  return (
    <>
      <span
        className={cn(
          "surface-inset mt-0.5 grid size-8 shrink-0 place-items-center rounded-[9px]",
          tone,
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {item.title}
          </span>
          {item.read ? null : (
            <>
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-primary"
              />
              <span className="sr-only">Unread</span>
            </>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {item.message}
        </span>
        <time
          className="mt-1 block font-geist-mono text-[10px] text-muted-foreground/70"
          dateTime={new Date(item.createdAt).toISOString()}
          title={fullTimestamp(item.createdAt)}
        >
          {relativeTime(item.createdAt)}
        </time>
      </span>
    </>
  );
}

export function NotificationItem({
  busy,
  item,
  mutate,
}: {
  busy: boolean;
  item: DashboardNotification;
  mutate: (action: "archive" | "read", id: string) => Promise<void>;
}) {
  const content = <NotificationContent item={item} />;
  const body = "flex min-w-0 flex-1 gap-3 text-left outline-none";
  return (
    <div
      className="group relative flex gap-2 rounded-tile p-2.5 transition-colors hover:bg-foreground/[0.035] focus-within:bg-foreground/[0.035]"
      data-icon-trigger
    >
      {item.href ? (
        <Link
          className={body}
          href={item.href}
          onClick={() => mutate("read", item.id)}
        >
          {content}
        </Link>
      ) : (
        <button
          className={body}
          onClick={() => mutate("read", item.id)}
          type="button"
        >
          {content}
        </button>
      )}
      <button
        aria-label="Archive notification"
        className="grid size-7 shrink-0 place-items-center self-start rounded-full text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-foreground/5 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        disabled={busy}
        onClick={() => mutate("archive", item.id)}
        type="button"
      >
        <LiveArchive className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
