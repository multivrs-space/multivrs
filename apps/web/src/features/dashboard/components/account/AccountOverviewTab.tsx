"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Plus, Search } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

export interface AccountTeamOverviewItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  status?: string;
  role?: string;
  twoFactorEnforced?: boolean;
}

interface AccountOverviewTabProps {
  teams?: AccountTeamOverviewItem[];
}

export function AccountOverviewTab({
  teams = [],
}: AccountOverviewTabProps) {
  const [search, setSearch] = useState("");
  const [twoFactorFilter, setTwoFactorFilter] = useState<"all" | "enforced" | "not-enforced">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setTeamName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setTeamSlug(generated);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamSlug.trim() || creating) return;

    setCreating(true);
    try {
      // Create organization via Better Auth organization plugin
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
      window.location.href = `/${teamSlug.trim()}/~/settings`;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase());

      const matches2FA =
        twoFactorFilter === "all"
          ? true
          : twoFactorFilter === "enforced"
          ? Boolean(t.twoFactorEnforced)
          : !t.twoFactorEnforced;

      return matchesSearch && matches2FA;
    });
  }, [teams, search, twoFactorFilter]);

  return (
    <div className="space-y-6">
      {/* Header matching Vercel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Teams</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The teams that are associated with your Multivrs account.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-8 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 gap-1.5 px-3 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          Create a Team
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search for a team */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for a team"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-muted/40 pl-8.5 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            /
          </kbd>
        </div>

        {/* 2FA Status selector */}
        <Select
          value={twoFactorFilter}
          onValueChange={(val) =>
            setTwoFactorFilter(val as "all" | "enforced" | "not-enforced")
          }
        >
          <SelectTrigger className="h-9 w-36 rounded-md border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted">
            <SelectValue placeholder="2FA Status" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            <SelectItem value="all" className="text-xs">
              2FA Status
            </SelectItem>
            <SelectItem value="enforced" className="text-xs">
              Enforced
            </SelectItem>
            <SelectItem value="not-enforced" className="text-xs">
              Not Enforced
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teams Container */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const planDisplay = (team.plan || "hobby").toLowerCase();
            const formattedPlan =
              planDisplay === "enterprise"
                ? "Enterprise"
                : planDisplay === "pro"
                ? "Pro"
                : "Hobby";

            return (
              <div
                key={team.id || team.slug}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Team Avatar */}
                  <TeamAvatar
                    name={team.name || team.slug}
                    logo={team.logo}
                    size={32}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${team.slug}`}
                        className="truncate text-sm font-medium text-foreground hover:underline underline-offset-4"
                      >
                        {team.name || team.slug}
                      </Link>
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {formattedPlan}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {team.role || "Owner"}
                    </p>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Team options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 border-border bg-popover text-popover-foreground"
                  >
                    <DropdownMenuItem asChild className="text-xs">
                      <Link href={`/${team.slug}/~/settings`}>
                        Team Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-xs">
                      <Link href={`/${team.slug}`}>
                        View Projects
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {search
              ? "No teams found matching your search."
              : "No teams associated with this account."}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">Create a Team</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Teams allow you to collaborate on projects, manage members, and scale.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name" className="text-xs font-medium text-foreground">
                Team Name
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Corp"
                required
                className="h-8 border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="team-slug" className="text-xs font-medium text-foreground">
                Team URL Slug
              </Label>
              <div className="flex items-center rounded-md border border-border bg-background px-3 text-xs text-muted-foreground">
                <span>multivrs.space/</span>
                <input
                  id="team-slug"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value.toLowerCase())}
                  placeholder="acme-corp"
                  required
                  className="h-8 flex-1 bg-transparent px-1 text-xs text-foreground placeholder:text-muted-foreground outline-none"
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
    </div>
  );
}
