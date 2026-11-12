"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { WorkspaceMember } from "@/features/dashboard/hooks/useWorkspaceMembers";

/** Confirms removing someone, or leaving yourself, before it happens. */
export function RemoveMemberDialog({
  member,
  leaving,
  busy,
  onConfirm,
  onCancel,
}: {
  member: WorkspaceMember | null;
  leaving: boolean;
  busy: boolean;
  onConfirm: (member: WorkspaceMember) => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmDialog
      busy={busy}
      confirmLabel={leaving ? "Leave" : "Remove"}
      description={
        leaving
          ? "You lose access to this team's projects straight away. Someone will have to invite you back."
          : "They lose access to this team's projects straight away."
      }
      onConfirm={() => member && onConfirm(member)}
      onOpenChange={(open) => (open ? null : onCancel())}
      open={member !== null}
      title={
        leaving
          ? "Leave this team?"
          : `Remove ${member?.user.name || member?.user.email}?`
      }
    />
  );
}
