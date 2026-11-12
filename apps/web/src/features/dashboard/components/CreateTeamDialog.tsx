"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_DIALOG, DASH_FIELD } from "@/components/dashboard/menu";
import { LiveUsers } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Name a new team; its URL slug follows the name until edited. */
export function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = teamName.trim();
    const slug = teamSlug.trim();
    if (!name || !slug || creating) return;
    setCreating(true);
    try {
      const res = await authClient.organization.create({ name, slug });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to create team");
      }
      toast.success("Team created");
      onOpenChange(false);
      setTeamName("");
      setTeamSlug("");
      router.push(`/${slug}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className={cn(DASH_DIALOG, "sm:max-w-md")}>
        <DialogHeader className="gap-3">
          <span
            className="surface-raised grid size-10 place-items-center rounded-tile text-primary"
            data-icon-trigger
          >
            <LiveUsers className="size-5" strokeWidth={1.75} />
          </span>
          <DialogTitle className="text-lg font-semibold tracking-[-0.02em]">
            Create a team
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            A shared workspace for projects, members and billing.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={create}>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" htmlFor="switcher-team-name">
              Team name
            </Label>
            <Input
              className={DASH_FIELD}
              id="switcher-team-name"
              onChange={(event) => {
                setTeamName(event.target.value);
                setTeamSlug(slugify(event.target.value));
              }}
              placeholder="Acme Corp"
              required
              value={teamName}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" htmlFor="switcher-team-slug">
              Team URL
            </Label>
            <label
              className={cn(
                DASH_FIELD,
                "flex items-center px-3 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50",
              )}
              htmlFor="switcher-team-slug"
            >
              <span className="font-geist-mono text-xs">multivrs.space/</span>
              <input
                className="h-full min-w-0 flex-1 bg-transparent px-0.5 font-geist-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                id="switcher-team-slug"
                onChange={(event) =>
                  setTeamSlug(event.target.value.toLowerCase())
                }
                placeholder="acme-corp"
                required
                value={teamSlug}
              />
            </label>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              type="button"
              variant="quiet"
            >
              Cancel
            </Button>
            <Button
              disabled={creating || !teamName.trim() || !teamSlug.trim()}
              size="sm"
              type="submit"
              variant="hero"
            >
              {creating ? "Creating…" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
