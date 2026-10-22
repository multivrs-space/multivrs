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
          <h1 className="text-xl font-semibold text-white tracking-tight">Teams</h1>
          <p className="mt-1 text-xs text-zinc-400">
            The teams that are associated with your Multivrs account.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-8 rounded-md bg-white text-xs font-medium text-black hover:bg-zinc-200 gap-1.5 px-3 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          Create a Team
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search for a team */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for a team"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 pl-8.5 pr-8 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-zinc-800 bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
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
          <SelectTrigger className="h-9 w-36 rounded-md border-zinc-800 bg-zinc-900/60 px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800/80">
            <SelectValue placeholder="2FA Status" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
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
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 divide-y divide-zinc-800/60 overflow-hidden">
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
                className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-900/20"
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
                        className="truncate text-sm font-medium text-white hover:underline underline-offset-4"
                      >
                        {team.name || team.slug}
                      </Link>
                      <span className="rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        {formattedPlan}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 capitalize">
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
                      className="size-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Team options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 border-zinc-800 bg-zinc-900 text-zinc-200"
                  >
                    <DropdownMenuItem asChild className="text-xs focus:bg-zinc-800 focus:text-white">
                      <Link href={`/${team.slug}/~/settings`}>
                        Team Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-xs focus:bg-zinc-800 focus:text-white">
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
          <div className="py-12 text-center text-xs text-zinc-500">
            {search
              ? "No teams found matching your search."
              : "No teams associated with this account."}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create a Team</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Teams allow you to collaborate on projects, manage members, and scale.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name" className="text-xs font-medium text-zinc-300">
                Team Name
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Corp"
                required
                className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="team-slug" className="text-xs font-medium text-zinc-300">
                Team URL Slug
              </Label>
              <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-500">
                <span>multivrs.space/</span>
                <input
                  id="team-slug"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value.toLowerCase())}
                  placeholder="acme-corp"
                  required
                  className="h-8 flex-1 bg-transparent px-1 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
                className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creating || !teamName.trim() || !teamSlug.trim()}
                className="h-8 bg-white text-xs font-medium text-black hover:bg-zinc-200"
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
