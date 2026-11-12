"use client";

import { DASH_FIELD } from "@/components/dashboard/menu";
import { LiveRefresh, LiveTrash, LiveX } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { WORKSPACE_ROLES } from "@/features/dashboard/constants/workspace-roles";
import type {
  WorkspaceInvitation,
  WorkspaceMember,
} from "@/features/dashboard/hooks/useWorkspaceMembers";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { cn } from "@/lib/utils";

const ROLE_SELECT = cn(
  DASH_FIELD,
  "h-8 w-auto border px-2 text-[12.5px] capitalize",
);

/** One person on the team: who, their role (editable), and remove or leave. */
export function MemberRow({
  member,
  you,
  busy,
  onRole,
  onRemove,
}: {
  member: WorkspaceMember;
  you: boolean;
  busy: boolean;
  onRole: (role: string) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <SenderAvatar
        address={member.user.email}
        name={member.user.name || undefined}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[13.5px] font-medium text-foreground">
          {member.user.name || member.user.email}
          {you ? (
            <span className="rounded-full bg-primary/10 px-1.5 text-[10.5px] font-medium text-primary">
              You
            </span>
          ) : null}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {member.user.email}
        </p>
      </div>
      <select
        aria-label={`Role for ${member.user.email}`}
        className={ROLE_SELECT}
        disabled={busy}
        onChange={(event) => onRole(event.target.value)}
        value={member.role}
      >
        {WORKSPACE_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <Button
        aria-label={you ? "Leave team" : `Remove ${member.user.email}`}
        className="size-8 rounded-full"
        data-icon-trigger
        disabled={busy}
        onClick={onRemove}
        size="icon-sm"
        variant="quiet"
      >
        <LiveTrash strokeWidth={1.75} />
      </Button>
    </li>
  );
}

const EXPIRES = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** An invitation still waiting: resend it or call it off. */
export function InvitationRow({
  invitation,
  busy,
  onResend,
  onCancel,
}: {
  invitation: WorkspaceInvitation;
  busy: boolean;
  onResend: () => void;
  onCancel: () => void;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="hatch grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-medium text-muted-foreground">
        ?
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-foreground">
          {invitation.email}
        </p>
        <p className="text-[12px] capitalize text-muted-foreground">
          {invitation.role} · expires{" "}
          {EXPIRES.format(new Date(invitation.expiresAt))}
        </p>
      </div>
      <Button
        aria-label={`Resend to ${invitation.email}`}
        className="size-8 rounded-full"
        data-icon-trigger
        disabled={busy}
        onClick={onResend}
        size="icon-sm"
        variant="quiet"
      >
        <LiveRefresh strokeWidth={1.75} />
      </Button>
      <Button
        aria-label={`Cancel invitation to ${invitation.email}`}
        className="size-8 rounded-full"
        data-icon-trigger
        disabled={busy}
        onClick={onCancel}
        size="icon-sm"
        variant="quiet"
      >
        <LiveX strokeWidth={1.75} />
      </Button>
    </li>
  );
}
