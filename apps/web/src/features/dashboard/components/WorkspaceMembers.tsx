"use client";

import { useState } from "react";
import { SkeletonRows } from "@/components/dashboard/SkeletonCard";
import {
  InvitationRow,
  MemberRow,
} from "@/features/dashboard/components/team/MemberRows";
import { RemoveMemberDialog } from "@/features/dashboard/components/team/RemoveMemberDialog";
import { useMemberAction } from "@/features/dashboard/components/team/useMemberAction";
import { isWorkspaceRole } from "@/features/dashboard/constants/workspace-roles";
import type {
  useWorkspaceMembers,
  WorkspaceMember,
} from "@/features/dashboard/hooks/useWorkspaceMembers";
import { authClient } from "@/lib/auth-client";

const HEADING =
  "mb-1 font-geist-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground";

/** Members and pending invitations of one team: roles, removal, resends. */
export function WorkspaceMembers({
  organizationId,
  workspace,
}: {
  organizationId: string;
  workspace: ReturnType<typeof useWorkspaceMembers>;
}) {
  const { data: session } = authClient.useSession();
  const { team, error, reload } = workspace;
  const { busy, act } = useMemberAction(reload);
  const [removing, setRemoving] = useState<WorkspaceMember | null>(null);
  const org = authClient.organization;

  if (!organizationId) return null;
  if (error)
    return (
      <p className="text-[13px] text-rose-600 dark:text-rose-400">{error}</p>
    );
  if (!team) return <SkeletonRows rows={3} />;
  const leaving = removing?.userId === session?.user.id;

  return (
    <div className="space-y-5">
      <div>
        <h3 className={HEADING}>Members · {team.members.length}</h3>
        <ul className="divide-y divide-hairline">
          {team.members.map((member) => (
            <MemberRow
              busy={busy !== null}
              key={member.id}
              member={member}
              onRemove={() => setRemoving(member)}
              onRole={(role) =>
                isWorkspaceRole(role) &&
                void act(
                  member.id,
                  () =>
                    org.updateMemberRole({
                      memberId: member.id,
                      organizationId,
                      role,
                    }),
                  "Role updated.",
                )
              }
              you={member.userId === session?.user.id}
            />
          ))}
        </ul>
      </div>
      {team.invitations.length ? (
        <div>
          <h3 className={HEADING}>
            Waiting to join · {team.invitations.length}
          </h3>
          <ul className="divide-y divide-hairline">
            {team.invitations.map((invitation) => (
              <InvitationRow
                busy={busy !== null}
                invitation={invitation}
                key={invitation.id}
                onCancel={() =>
                  void act(
                    invitation.id,
                    () => org.cancelInvitation({ invitationId: invitation.id }),
                    "Invitation canceled.",
                  )
                }
                onResend={() =>
                  void act(
                    invitation.id,
                    () =>
                      org.inviteMember({
                        email: invitation.email,
                        organizationId,
                        resend: true,
                        role: isWorkspaceRole(invitation.role)
                          ? invitation.role
                          : "viewer",
                      }),
                    "Invitation sent again.",
                  )
                }
              />
            ))}
          </ul>
        </div>
      ) : null}
      <RemoveMemberDialog
        busy={busy !== null}
        leaving={leaving}
        member={removing}
        onCancel={() => setRemoving(null)}
        onConfirm={(member) => {
          setRemoving(null);
          void act(
            member.id,
            () =>
              leaving
                ? org.leave({ organizationId })
                : org.removeMember({
                    memberIdOrEmail: member.id,
                    organizationId,
                  }),
            leaving ? "You left the team." : "Member removed.",
          );
        }}
      />
    </div>
  );
}
