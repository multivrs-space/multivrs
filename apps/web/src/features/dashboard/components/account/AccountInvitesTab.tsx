"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TeamAvatar } from "@/components/TeamAvatar";
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

interface AccountInvitesTabProps {
  invites?: AccountInviteItem[];
}

export function AccountInvitesTab({
  invites = [],
}: AccountInvitesTabProps) {
  const [items, setItems] = useState<AccountInviteItem[]>(invites);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (invite: AccountInviteItem) => {
    if (processingId) return;
    setProcessingId(invite.id);
    try {
      const res = await authClient.organization.acceptInvitation({
        invitationId: invite.id,
      });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to accept invite");
      }
      toast.success(`Joined ${invite.organizationName}`);
      setItems((prev) => prev.filter((i) => i.id !== invite.id));
      window.location.href = `/${invite.organizationSlug}`;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invite: AccountInviteItem) => {
    if (processingId) return;
    setProcessingId(invite.id);
    try {
      const res = await authClient.organization.rejectInvitation({
        invitationId: invite.id,
      });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to decline invite");
      }
      toast.success("Invitation declined");
      setItems((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to decline invite");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Vercel */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Invites</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your Multivrs team invites.
        </p>
      </div>

      {/* Invites Container */}
      <div className="rounded-xl border border-border bg-card p-6 min-h-[380px] flex flex-col justify-center">
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <TeamAvatar
                    name={invite.organizationName}
                    logo={invite.organizationLogo}
                    size={32}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {invite.organizationName}
                      </span>
                      {invite.role && (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                          {invite.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invite.inviterName || invite.inviterEmail || "team owner"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === invite.id}
                    onClick={() => handleReject(invite)}
                    className="h-8 border-border bg-background text-xs text-foreground hover:bg-muted gap-1 cursor-pointer"
                  >
                    <X className="size-3.5" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    disabled={processingId === invite.id}
                    onClick={() => handleAccept(invite)}
                    className="h-8 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 gap-1 cursor-pointer"
                  >
                    <Check className="size-3.5" />
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Exact empty state matching Vercel style */
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground mb-3.5">
              <Mail className="size-5" />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              No Invites Yet
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              When a team invites you, it&apos;ll show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
