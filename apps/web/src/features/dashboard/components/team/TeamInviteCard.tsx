"use client";

import { useState } from "react";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveMailPlus, LiveSend } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import {
  INVITE_ROLES,
  type InviteRole,
  isInviteRole,
} from "@/features/dashboard/constants/workspace-roles";
import { cn } from "@/lib/utils";

/** Invite by email with a role; the team is created on the first invite. */
export function TeamInviteCard({
  disabled,
  onInvite,
}: {
  disabled: boolean;
  onInvite: (email: string, role: InviteRole) => Promise<boolean>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("developer");
  function send() {
    if (!email.trim() || disabled) return;
    void onInvite(email.trim(), role).then((sent) => sent && setEmail(""));
  }
  return (
    <SettingsCard id="invite">
      <SettingsCardBody
        description="They can open and work on all your projects. Their role decides what they can change."
        icon={LiveMailPlus}
        title="Invite someone"
      >
        <form
          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            aria-label="Email"
            className={cn(DASH_FIELD, "w-full border px-3")}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            type="email"
            value={email}
          />
          <select
            aria-label="Role"
            className={cn(DASH_FIELD, "w-full border px-3 capitalize")}
            onChange={(event) =>
              isInviteRole(event.target.value) && setRole(event.target.value)
            }
            value={role}
          >
            {INVITE_ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button
            data-icon-trigger
            disabled={disabled || !email.trim()}
            size="sm"
            type="submit"
            variant="hero"
          >
            <LiveSend strokeWidth={1.75} />
            Send invite
          </Button>
        </form>
      </SettingsCardBody>
    </SettingsCard>
  );
}
