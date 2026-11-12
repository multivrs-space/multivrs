"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import {
  LiveRefresh,
  LiveSettings,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DomainActionsProps {
  domainId: string;
  detailUrl: string;
  hostname: string;
  initialAutoRenew?: boolean;
}

export function DomainActions({
  domainId,
  detailUrl,
  hostname,
  initialAutoRenew = true,
}: DomainActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [autoRenew, setAutoRenew] = useState(initialAutoRenew);
  const [renewPending, setRenewPending] = useState(false);

  async function toggleAutoRenew() {
    if (renewPending) return;
    const next = !autoRenew;
    setAutoRenew(next);
    setRenewPending(true);
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ autoRenew: next }),
      });
      if (!response.ok) {
        setAutoRenew(!next);
        setRenewPending(false);
        toast.error("Unable to update auto renewal");
        return;
      }
      setRenewPending(false);
      toast.success(`Auto renewal ${next ? "enabled" : "disabled"}`);
    } catch {
      setAutoRenew(!next);
      setRenewPending(false);
      toast.error("Unable to update auto renewal");
    }
  }

  function remove() {
    startTransition(async () => {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      }).catch(() => null);
      if (!response?.ok) {
        toast.error(await responseError(response, "Unable to delete domain"));
        return;
      }
      setConfirmDelete(false);
      toast.success(`${hostname} deleted`);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`${hostname} actions`}
          className="size-8 text-muted-foreground"
          disabled={pending}
          size="icon-sm"
          variant="quiet"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-64")}>
        <DropdownMenuLabel className="truncate px-2.5 py-1.5 font-geist-mono text-[11px] font-normal text-muted-foreground">
          {hostname}
        </DropdownMenuLabel>
        <div
          className="flex items-center justify-between gap-3 rounded-control px-2.5 py-2 text-[13px]"
          data-icon-trigger
        >
          <span className="flex items-center gap-2.5 text-muted-foreground">
            <LiveRefresh className="size-4" strokeWidth={1.75} />
            Auto renewal
          </span>
          <Switch
            aria-label={`Turn auto renewal ${autoRenew ? "off" : "on"} for ${hostname}`}
            checked={autoRenew}
            disabled={renewPending}
            onCheckedChange={() => toggleAutoRenew()}
          />
        </div>
        <DropdownMenuItem
          className={DASH_MENU_ITEM}
          data-icon-trigger
          onClick={() => router.push(detailUrl)}
        >
          <LiveSettings strokeWidth={1.75} />
          Configure
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
        <DropdownMenuItem
          className={cn(
            DASH_MENU_ITEM,
            "text-rose-600 focus:text-rose-600 dark:text-rose-400",
          )}
          data-icon-trigger
          onClick={() => setConfirmDelete(true)}
        >
          <LiveTrash strokeWidth={1.75} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ConfirmDialog
        busy={pending}
        description="This removes the domain from Multivrs."
        onConfirm={remove}
        onOpenChange={setConfirmDelete}
        open={confirmDelete}
        title={`Delete ${hostname}?`}
      />
    </DropdownMenu>
  );
}
