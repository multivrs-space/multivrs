"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const FIELD = cn(DASH_FIELD, "w-full border px-3");

/** Current and new password, optionally signing every other device out. */
export function PasswordForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [busy, setBusy] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!current || next.length < 8) return;
    setBusy(true);
    void authClient
      .changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: signOutOthers,
      })
      .then((result) => {
        if (result.error)
          return void toast.error(
            result.error.message ?? "Password could not be changed.",
          );
        toast.success("Password changed.");
        onDone();
        router.refresh();
      })
      .catch(() => toast.error("Password could not be changed."))
      .finally(() => setBusy(false));
  }

  return (
    <form className="mt-3 max-w-sm space-y-3 sm:pl-12" onSubmit={submit}>
      <input
        aria-label="Current password"
        autoComplete="current-password"
        className={FIELD}
        onChange={(event) => setCurrent(event.target.value)}
        placeholder="Current password"
        required
        type="password"
        value={current}
      />
      <input
        aria-label="New password"
        autoComplete="new-password"
        className={FIELD}
        minLength={8}
        onChange={(event) => setNext(event.target.value)}
        placeholder="New password, at least 8 characters"
        required
        type="password"
        value={next}
      />
      {/* biome-ignore lint/a11y/noLabelWithoutControl: the Switch is the control; clicking the text toggles it. */}
      <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Switch
          checked={signOutOthers}
          onCheckedChange={setSignOutOthers}
          size="sm"
        />
        Sign out of other devices
      </label>
      <Button
        disabled={busy || !current || next.length < 8}
        size="sm"
        type="submit"
        variant="hero"
      >
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
