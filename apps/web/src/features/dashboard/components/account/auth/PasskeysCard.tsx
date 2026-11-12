"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  LiveFingerprint,
  LivePlus,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { MethodRow } from "@/features/dashboard/components/account/auth/MethodRow";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { describeDevice } from "@/features/dashboard/lib/describe-device";
import type { AccountPasskey } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

const ADDED = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Passkeys on the account: add this device, or remove one you've lost. */
export function PasskeysCard({
  passkeys,
  otherMethods,
}: {
  passkeys: AccountPasskey[] | null;
  otherMethods: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [removing, setRemoving] = useState<AccountPasskey | null>(null);

  function add() {
    setBusy("add");
    void authClient.passkey
      .addPasskey({ name: describeDevice(navigator.userAgent).label })
      .then((result) => {
        if (result?.error)
          return void toast.error(
            result.error.message ?? "The passkey couldn't be added.",
          );
        toast.success("Passkey added. You can sign in with it now.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be added."))
      .finally(() => setBusy(null));
  }

  function remove(passkey: AccountPasskey) {
    setBusy(passkey.id);
    void authClient.passkey
      .deletePasskey({ id: passkey.id })
      .then((result) => {
        if (result?.error)
          return void toast.error(
            result.error.message ?? "The passkey couldn't be removed.",
          );
        toast.success("Passkey removed.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be removed."))
      .finally(() => setBusy(null));
  }

  return (
    <SettingsCard id="passkeys">
      <SettingsCardBody
        aside={
          <Button
            data-icon-trigger
            disabled={busy === "add"}
            onClick={add}
            size="sm"
            variant="raised"
          >
            <LivePlus strokeWidth={2} />
            {busy === "add" ? "Waiting for device…" : "Add passkey"}
          </Button>
        }
        description="Sign in with your fingerprint, face or device PIN. Phishing-proof, and nothing to remember."
        icon={LiveFingerprint}
        title="Passkeys"
      >
        {passkeys === null ? (
          <p className="text-[13px] text-muted-foreground">
            Passkeys couldn't load just now. Refresh to try again.
          </p>
        ) : passkeys.length ? (
          <ul className="divide-y divide-hairline">
            {passkeys.map((passkey) => (
              <MethodRow
                detail={
                  passkey.createdAt
                    ? `Added ${ADDED.format(new Date(passkey.createdAt))}`
                    : "Passkey"
                }
                icon={<LiveFingerprint className="size-4" strokeWidth={1.75} />}
                key={passkey.id}
                title={passkey.name || passkey.provider || "Passkey"}
              >
                <Button
                  aria-label={`Remove ${passkey.name || "passkey"}`}
                  className="size-8 rounded-full"
                  data-icon-trigger
                  disabled={busy === passkey.id}
                  onClick={() =>
                    otherMethods === 0 && passkeys.length === 1
                      ? toast.error(
                          "Add another way to sign in before removing your only passkey.",
                        )
                      : setRemoving(passkey)
                  }
                  size="icon-sm"
                  variant="quiet"
                >
                  <LiveTrash strokeWidth={1.75} />
                </Button>
              </MethodRow>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted-foreground">
            No passkeys yet. Add one for this device.
          </p>
        )}
      </SettingsCardBody>
      <ConfirmDialog
        confirmLabel="Remove"
        description="You won't be able to sign in with it any more. Your other sign-in methods keep working."
        onConfirm={() => {
          if (removing) remove(removing);
          setRemoving(null);
        }}
        onOpenChange={(open) => (open ? null : setRemoving(null))}
        open={removing !== null}
        title={`Remove ${removing?.name || "this passkey"}?`}
      />
    </SettingsCard>
  );
}
