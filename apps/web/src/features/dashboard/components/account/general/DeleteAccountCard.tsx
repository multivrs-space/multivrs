"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveTrash, LiveTriangleAlert } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import type { AccountDeletionBlocker } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Deletes the account after an emailed confirmation. Anything that lives
 * outside Multivrs (plans, domains, projects) has to be removed first.
 */
export function DeleteAccountCard({
  username,
  email,
  blockers,
}: {
  username: string;
  email: string;
  blockers: AccountDeletionBlocker[];
}) {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function request() {
    if (confirmation !== username || busy) return;
    setBusy(true);
    void authClient
      .deleteUser({ callbackURL: "/home" })
      .then((result) =>
        result.error
          ? toast.error(
              result.error.message ?? "Your account couldn't be deleted.",
            )
          : setSent(true),
      )
      .catch(() => toast.error("Your account couldn't be deleted."))
      .finally(() => setBusy(false));
  }

  return (
    <SettingsCard danger id="delete-account">
      <SettingsCardBody
        description="Your account, your team and everything in it, for good. This can't be undone."
        icon={LiveTrash}
        title="Delete account"
      >
        {blockers.length ? (
          <div className="space-y-2" data-icon-trigger>
            <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <LiveTriangleAlert
                className="size-4 text-amber-600 dark:text-amber-400"
                strokeWidth={1.75}
              />
              First, clear these up:
            </p>
            <ul className="space-y-1.5 pl-6 text-[13px]">
              {blockers.map((blocker) => (
                <li key={blocker.message}>
                  <Link
                    className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    href={blocker.href}
                  >
                    {blocker.message}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : sent ? (
          <p className="text-[13px] text-muted-foreground">
            We sent a confirmation link to {email}. Your account is deleted when
            you open it.
          </p>
        ) : (
          <label
            className="block max-w-md space-y-1.5 text-[12px] text-muted-foreground"
            htmlFor="delete-account-confirmation"
          >
            <span>
              Type{" "}
              <span className="font-geist-mono text-foreground">
                {username}
              </span>{" "}
              to confirm
            </span>
            <input
              autoComplete="off"
              className={cn(DASH_FIELD, "w-full border px-3")}
              id="delete-account-confirmation"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
        )}
      </SettingsCardBody>
      {blockers.length || sent ? null : (
        <SettingsCardFooter
          action={
            <Button
              disabled={confirmation !== username || busy}
              onClick={request}
              size="sm"
              variant="danger"
            >
              {busy ? "Sending…" : "Delete account"}
            </Button>
          }
          danger
          helperText={`We'll email ${email} a link to confirm.`}
        />
      )}
    </SettingsCard>
  );
}
