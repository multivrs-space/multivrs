"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { LiveFileUp } from "@/components/icons/animated";
import { TeamAvatar } from "@/components/TeamAvatar";
import {
  removeTeamAvatar,
  uploadTeamAvatar,
} from "@/features/dashboard/components/team/team-requests";
import type { AccountTeam } from "@/lib/services/account-team.service";

/** The team's picture: click to upload, with a remove link once one is set. */
export function TeamAvatarField({
  team,
  onChange,
}: {
  team: AccountTeam;
  onChange: (team: AccountTeam) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function run(request: () => Promise<AccountTeam>, success: string) {
    setBusy(true);
    void request()
      .then((updated) => {
        onChange(updated);
        toast.success(success);
      })
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "That didn't work",
        ),
      )
      .finally(() => setBusy(false));
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <input
        accept="image/png,image/jpeg,image/webp"
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) run(() => uploadTeamAvatar(file), "Team avatar updated");
        }}
        ref={input}
        tabIndex={-1}
        type="file"
      />
      <button
        aria-label="Upload a team avatar"
        className="group surface-raised relative grid size-20 place-items-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        data-icon-trigger
        disabled={busy}
        onClick={() => input.current?.click()}
        type="button"
      >
        <TeamAvatar
          className="size-full"
          logo={team.logo}
          name={team.name}
          size={80}
        />
        <span className="absolute inset-0 grid place-items-center bg-ink/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium text-foreground">
            <LiveFileUp className="size-4" strokeWidth={1.75} />
            {busy ? "Uploading…" : "Upload"}
          </span>
        </span>
      </button>
      {team.logo ? (
        <button
          className="text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
          disabled={busy}
          onClick={() => run(removeTeamAvatar, "Team avatar removed")}
          type="button"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
