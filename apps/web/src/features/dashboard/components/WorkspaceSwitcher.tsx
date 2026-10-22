"use client";

import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TeamAvatar } from "@/components/TeamAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";
import { authClient } from "@/lib/auth-client";
import type { PlanKey } from "@/lib/payments/billing.types";

const PLAN_LABELS: Record<PlanKey, string> = {
  hobby: "Hobby",
  pro: "Pro",
  enterprise: "Enterprise",
};

interface WorkspaceSwitcherProps {
  workspace: CurrentWorkspace;
  /** Your own account first, then teams you're on. */
  workspaces: DashboardWorkspace[];
}

export function WorkspaceSwitcher({
  workspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const currentPlanLabel = workspace.plan
    ? PLAN_LABELS[workspace.plan] || workspace.plan
    : null;

  // Split own and other teams
  const otherWorkspaces = useMemo(() => {
    return workspaces.filter((w) => w.username !== workspace.username);
  }, [workspaces, workspace.username]);

  // Filtered other teams
  const filteredOther = useMemo(() => {
    if (!searchQuery.trim()) return otherWorkspaces;
    const query = searchQuery.toLowerCase().trim();
    return otherWorkspaces.filter(
      (w) =>
        (w.name && w.name.toLowerCase().includes(query)) ||
        w.username.toLowerCase().includes(query),
    );
  }, [otherWorkspaces, searchQuery]);

  const handleNameChange = (val: string) => {
    setTeamName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setTeamSlug(slug);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamSlug.trim() || creating) return;

    setCreating(true);
    try {
      const res = await authClient.organization.create({
        name: teamName.trim(),
        slug: teamSlug.trim(),
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to create team");
      }

      toast.success("Team created successfully");
      setCreateDialogOpen(false);
      setTeamName("");
      setTeamSlug("");
      router.push(`/${teamSlug.trim()}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          aria-label="Switch workspace"
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg px-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-muted cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <WorkspaceAvatar workspace={workspace} size={20} />
            <span className="truncate text-xs font-medium text-foreground">
              {workspace.name || workspace.username}
            </span>
            {currentPlanLabel && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize border border-border">
                {currentPlanLabel}
              </span>
            )}
          </div>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
            <ChevronsUpDown className="size-3.5" strokeWidth={1.75} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-72 rounded-xl border border-border bg-popover text-popover-foreground p-1.5 shadow-2xl font-sans"
        >
          {/* Search Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border mb-1">
            <input
              type="text"
              placeholder="Find Team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none pr-2"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDropdownOpen(false);
                }
              }}
            />
            <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              Esc
            </kbd>
          </div>

          {/* Current Workspace Row */}
          <div className="flex items-center justify-between rounded-lg bg-accent px-2.5 py-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <WorkspaceAvatar workspace={workspace} size={18} />
              <span className="truncate font-medium text-foreground">
                {workspace.name || workspace.username}
              </span>
              {currentPlanLabel && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize border border-border">
                  {currentPlanLabel}
                </span>
              )}
            </div>
            <Check className="size-4 text-foreground stroke-[2.5] shrink-0" />
          </div>

          {/* Other Workspaces List if searching or available */}
          {filteredOther.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {filteredOther.map((item) => {
                const planLabel = item.plan
                  ? PLAN_LABELS[item.plan] || item.plan
                  : null;
                return (
                  <DropdownMenuItem
                    key={item.username}
                    asChild
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Link
                      href={`/${item.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WorkspaceAvatar workspace={item} size={18} />
                        <span className="truncate text-foreground">
                          {item.name || item.username}
                        </span>
                        {planLabel && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize border border-border">
                            {planLabel}
                          </span>
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {/* Empty State when no other workspaces exist and not searching */}
          {otherWorkspaces.length === 0 && !searchQuery.trim() && (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground mb-2.5">
                <Users className="size-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[210px] leading-relaxed">
                Teams you create and join appear here for quick context switching.
              </p>
            </div>
          )}

          {/* No search results */}
          {searchQuery.trim() && filteredOther.length === 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No team found
            </div>
          )}

          <DropdownMenuSeparator className="my-1 border-t border-border bg-transparent" />

          {/* Bottom Action: Create Team */}
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setCreateDialogOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent cursor-pointer group"
          >
            <Plus className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                Create Team
              </p>
              <p className="text-[11px] text-muted-foreground">
                Collaborate with others in a shared workspace
              </p>
            </div>
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sleek Vercel-style Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
              Create a Team
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Teams allow you to collaborate on projects, manage members, and scale.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="switcher-team-name" className="text-xs font-medium text-foreground">
                Team Name
              </Label>
              <Input
                id="switcher-team-name"
                value={teamName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Corp"
                required
                className="h-9 border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="switcher-team-slug" className="text-xs font-medium text-foreground">
                Team URL Slug
              </Label>
              <div className="flex items-center rounded-md border border-border bg-background px-3 text-xs text-muted-foreground">
                <span>multivrs.space/</span>
                <input
                  id="switcher-team-slug"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value.toLowerCase())}
                  placeholder="acme-corp"
                  required
                  className="h-9 flex-1 bg-transparent px-1 text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
                className="h-8 border-border bg-background text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creating || !teamName.trim() || !teamSlug.trim()}
                className="h-8 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {creating ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WorkspaceAvatar({
  workspace,
  size,
}: {
  workspace: DashboardWorkspace;
  size: number;
}) {
  return (
    <TeamAvatar
      name={workspace.name || workspace.username}
      image={workspace.image}
      size={size}
    />
  );
}
