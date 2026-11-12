"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveMail, LiveX } from "@/components/icons/animated";
import { TeamAvatar } from "@/components/TeamAvatar";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { authClient } from "@/lib/auth-client";

export interface AccountInviteItem {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLogo?: string | null;
  role?: string | null;
  inviterName?: string | null;
  inviterEmail?: string | null;
  createdAt: string;
}

/** Teams that asked you to join: accept to open their projects, or decline. */
export function AccountInvitesTab({
  invites = [],
}: {
  invites?: AccountInviteItem[];
}) {
  const [items, setItems] = useState(invites);
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(invite: AccountInviteItem, accept: boolean) {
    if (busy) return;
    setBusy(invite.id);
    try {
      const org = authClient.organization;
      const result = accept
        ? await org.acceptInvitation({ invitationId: invite.id })
        : await org.rejectInvitation({ invitationId: invite.id });
      if (result?.error)
        throw new Error(result.error.message || "That didn't work.");
      setItems((current) => current.filter((item) => item.id !== invite.id));
      if (accept) {
        toast.success(`Joined ${invite.organizationName}`);
        window.location.href = `/${invite.organizationSlug}`;
      } else toast.success("Invitation declined");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "That didn't work.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SettingsCard id="invites">
      <SettingsCardBody
        description="Accepting opens the team's projects with the role they gave you."
        icon={LiveMail}
        title="Team invitations"
      />
      {items.length ? (
        <ul className="divide-y divide-hairline px-5 pb-3 sm:px-6">
          {items.map((invite) => (
            <li
              className="flex flex-wrap items-center gap-3 py-3"
              key={invite.id}
            >
              <TeamAvatar
                logo={invite.organizationLogo}
                name={invite.organizationName}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13.5px] font-medium">
                  {invite.organizationName}
                  {invite.role ? (
                    <span className="rounded-full border border-hairline px-2 text-[10.5px] capitalize text-muted-foreground">
                      {invite.role}
                    </span>
                  ) : null}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Invited by{" "}
                  {invite.inviterName ||
                    invite.inviterEmail ||
                    "the team owner"}
                </p>
              </div>
              <Button
                data-icon-trigger
                disabled={busy === invite.id}
                onClick={() => void respond(invite, false)}
                size="sm"
                variant="quiet"
              >
                <LiveX strokeWidth={2} />
                Decline
              </Button>
              <Button
                disabled={busy === invite.id}
                onClick={() => void respond(invite, true)}
                size="sm"
                variant="hero"
              >
                Accept
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="pt-2"
          description="When a team invites you, it shows up here."
          glyph={LiveMail}
          title="No invitations"
        />
      )}
    </SettingsCard>
  );
}
