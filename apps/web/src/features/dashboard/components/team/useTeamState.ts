"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { responseError } from "@/components/ConfirmDialog";
import type { InviteRole } from "@/features/dashboard/constants/workspace-roles";
import { authClient } from "@/lib/auth-client";

export interface TeamState {
  team: { id: string; name: string; slug: string } | null;
  joined: Array<{
    organizationId: string;
    role: string;
    name: string;
    username: string;
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
    blocker: string | null;
  }>;
}

/**
 * Your account's team as the API sees it, plus the actions on it. The team
 * is created on the first invite, so there's nothing to set up beforehand.
 */
export function useTeamState() {
  const [state, setState] = useState<TeamState | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/team").catch(() => null);
    if (!response?.ok)
      return void toast.error(
        await responseError(response, "Couldn't load your team."),
      );
    setState((await response.json()) as TeamState);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function teamId(): Promise<string | null> {
    if (state?.team) return state.team.id;
    const response = await fetch("/api/team", { method: "POST" }).catch(
      () => null,
    );
    if (!response?.ok) {
      toast.error(await responseError(response, "Couldn't set up your team."));
      return null;
    }
    const team = (await response.json()) as NonNullable<TeamState["team"]>;
    setState((current) => (current ? { ...current, team } : current));
    return team.id;
  }

  /** Sends an invitation; resolves true when it went out. */
  async function invite(email: string, role: InviteRole): Promise<boolean> {
    setLoading(true);
    try {
      const organizationId = await teamId();
      if (!organizationId) return false;
      const result = await authClient.organization.inviteMember({
        email,
        organizationId,
        role,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Invitation failed.");
        return false;
      }
      toast.success("Invitation sent.");
      return true;
    } catch {
      toast.error("Invitation failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function adopt(organizationId: string) {
    setLoading(true);
    const response = await fetch("/api/team/adopt", {
      body: JSON.stringify({ organizationId }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }).catch(() => null);
    setLoading(false);
    if (!response?.ok)
      return void toast.error(
        await responseError(response, "That didn't work."),
      );
    toast.success("It's your team now. Its members can open your projects.");
    await load();
  }

  const adoptable = state?.team
    ? []
    : (state?.workspaces ?? []).filter(
        (workspace) => workspace.blocker === null,
      );
  const others = (state?.workspaces ?? []).filter(
    (workspace) => !adoptable.includes(workspace),
  );
  return { state, loading, invite, adopt, adoptable, others };
}
