"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LiveBell, LiveMailCheck } from "@/components/icons/animated";
import { NotificationItem } from "@/features/dashboard/components/NotificationItem";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function NotificationsPanel({
  initialNotifications,
}: {
  initialNotifications: DashboardNotification[];
}) {
  const [items, setItems] = useState(initialNotifications);
  const [busy, setBusy] = useState<string | null>(null);
  const unread = items.filter((item) => !item.read).length;

  async function mutate(action: "archive" | "read" | "read_all", id?: string) {
    setBusy(id ?? action);
    try {
      const response = await fetch("/api/notifications", {
        body: JSON.stringify({ action, id }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) {
        toast.error("Notification update failed");
        setBusy(null);
        return;
      }
      setItems((current) =>
        action === "archive"
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              action === "read_all" || item.id === id
                ? { ...item, read: true }
                : item,
            ),
      );
      toast.success(
        action === "archive"
          ? "Notification archived"
          : "Notifications updated",
      );
      setBusy(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Notification update failed",
      );
      setBusy(null);
    }
  }

  return (
    <div className="flex max-h-[460px] flex-col text-[13px]">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-semibold tracking-[-0.015em]">
            Notifications
          </p>
          {unread ? (
            <span className="figure rounded-full bg-primary/12 px-1.5 text-[11px] font-semibold leading-5 text-primary">
              {unread}
            </span>
          ) : null}
        </div>
        <button
          className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
          data-icon-trigger
          disabled={!unread || busy !== null}
          onClick={() => mutate("read_all")}
          type="button"
        >
          <LiveMailCheck className="size-3.5" strokeWidth={1.75} />
          Mark all read
        </button>
      </div>
      <div className="min-h-52 space-y-0.5 overflow-y-auto p-1.5 pt-0">
        {items.map((item) => (
          <NotificationItem
            busy={busy === item.id}
            item={item}
            key={item.id}
            mutate={mutate}
          />
        ))}
        {items.length ? null : (
          <div
            className="flex min-h-52 flex-col items-center justify-center gap-2 text-muted-foreground"
            data-icon-trigger
          >
            <span className="surface-inset grid size-10 place-items-center rounded-tile">
              <LiveBell className="size-5" strokeWidth={1.5} />
            </span>
            <p className="font-medium text-foreground">
              You&apos;re all caught up
            </p>
            <p className="text-xs">
              New deploys, invites and alerts land here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
