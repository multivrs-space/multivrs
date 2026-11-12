"use client";

import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LiveTriangleAlert } from "@/components/icons/animated";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** The app's own "are you sure?" dialog, instead of the browser's confirm(). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={DASH_DIALOG}>
        <AlertDialogHeader className="gap-3">
          <span
            className="grid size-10 place-items-center rounded-tile border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            data-icon-trigger
          >
            <LiveTriangleAlert className="size-5" strokeWidth={1.75} />
          </span>
          <AlertDialogTitle className="text-lg font-semibold tracking-[-0.02em]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={busy} size="sm" variant="quiet">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={onConfirm}
            size="sm"
            variant="danger"
          >
            {busy ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** The `error.message` from a failed API response, or `fallback`. */
export async function responseError(
  response: Response | null,
  fallback: string,
): Promise<string> {
  const body: unknown = await response?.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string" &&
    body.error.message !== "Internal server error"
  ) {
    return body.error.message;
  }
  return fallback;
}
