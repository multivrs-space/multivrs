"use client";

import { Check, Copy, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TeamAvatar } from "@/components/TeamAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { TeamManager } from "@/features/dashboard/components/TeamManager";
import { BillingManager } from "@/features/dashboard/components/BillingManager";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountTeam } from "@/lib/services/account-team.service";

interface TeamSettingsPageProps {
  initialTeam: AccountTeam;
  billing: BillingOverview;
  username: string;
}

export function TeamSettingsPage({
  initialTeam,
  billing,
  username,
}: TeamSettingsPageProps) {
  const router = useRouter();
  const [team, setTeam] = useState(initialTeam);
  const [name, setName] = useState(initialTeam.name);
  const [slug, setSlug] = useState(initialTeam.slug);
  const [savingName, setSavingName] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const saveName = async () => {
    if (!name.trim() || savingName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update team name");
      }
      const updated = await res.json();
      setTeam((t) => ({ ...t, name: updated.name }));
      toast.success("Team name updated");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update team name");
    } finally {
      setSavingName(false);
    }
  };

  const saveSlug = async () => {
    if (!slug.trim() || savingSlug) return;
    setSavingSlug(true);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update team URL");
      }
      const updated = await res.json();
      setTeam((t) => ({ ...t, slug: updated.slug }));
      toast.success("Team URL updated");
      if (updated.slug !== username) {
        router.replace(`/${updated.slug}/~/settings`);
      }
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update team URL");
    } finally {
      setSavingSlug(false);
    }
  };

  const copyTeamId = async () => {
    await navigator.clipboard.writeText(team.id);
    setCopiedId(true);
    toast.success("Team ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* General Section */}
        <section id="general" className="scroll-mt-6 space-y-6">
          {/* Team Name Card */}
          <SettingsCard>
            <SettingsCardBody
              title="Team Name"
              description="This is your team's visible name within Multivrs. For example, the name of your company or department."
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                className="max-w-md h-10 rounded-md border border-zinc-800 bg-black/60 px-3.5 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                placeholder="Acme Corp"
              />
            </SettingsCardBody>
            <SettingsCardFooter
              helperText="Please use 32 characters at maximum."
              action={
                <Button
                  size="sm"
                  className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
                  disabled={savingName || name === team.name || !name.trim()}
                  onClick={saveName}
                >
                  {savingName ? "Saving…" : "Save"}
                </Button>
              }
            />
          </SettingsCard>

          {/* Team URL Card */}
          <SettingsCard>
            <SettingsCardBody
              title="Team URL"
              description="This is your team's URL namespace on Multivrs. Within it, your team can inspect their projects, check out any recent activity, or configure settings to their liking."
            >
              <div className="flex max-w-md items-center rounded-md border border-zinc-800 bg-black/60 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400">
                <span className="flex h-10 items-center border-r border-zinc-800 bg-zinc-900/60 px-3.5 text-xs text-zinc-400 select-none font-mono">
                  multivrs.space/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  maxLength={48}
                  className="h-10 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="my-team"
                />
              </div>
            </SettingsCardBody>
            <SettingsCardFooter
              helperText="Please use 48 characters at maximum."
              action={
                <Button
                  size="sm"
                  className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
                  disabled={savingSlug || slug === team.slug || !slug.trim()}
                  onClick={saveSlug}
                >
                  {savingSlug ? "Saving…" : "Save"}
                </Button>
              }
            />
          </SettingsCard>

          {/* Team Avatar Card */}
          <SettingsCard>
            <SettingsCardBody
              title="Team Avatar"
              description={"This is your team's avatar.\nUpload a custom avatar from your files."}
              aside={
                <TeamAvatarField
                  team={team}
                  onChange={(updated) => {
                    setTeam(updated);
                    router.refresh();
                  }}
                />
              }
            />
            <SettingsCardFooter
              helperText="An avatar is optional but strongly recommended."
            />
          </SettingsCard>

          {/* Preview Deployment Suffix Card */}
          <SettingsCard>
            <SettingsCardBody
              title="Preview Deployment Suffix"
              description="By default, the URL of every new Preview Deployment ends with .multivrs.app. This setting allows you to choose your own custom domain in place of this suffix."
            >
              <div className="flex max-w-md items-center rounded-md border border-zinc-800 bg-black/60 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400">
                <input
                  readOnly
                  value="my-deployment."
                  className="h-10 w-36 bg-transparent px-3 text-sm text-zinc-500 font-mono outline-none"
                />
                <span className="flex h-10 items-center text-xs text-zinc-400 select-none font-mono">
                  multivrs.app
                </span>
              </div>
            </SettingsCardBody>
            <SettingsCardFooter
              helperText="This feature is available on the Pro plan for $100 per month."
              action={
                <Button
                  size="sm"
                  className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4"
                >
                  Upgrade
                </Button>
              }
            />
          </SettingsCard>

          {/* Team ID Card */}
          <SettingsCard>
            <SettingsCardBody
              title="Team ID"
              description="This is your team's ID within Multivrs."
            >
              <div className="flex max-w-md items-center gap-2">
                <Input
                  readOnly
                  value={team.id}
                  className="h-10 font-mono text-xs text-zinc-400 bg-black/60 border-zinc-800 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 shrink-0 gap-1.5 border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs"
                  onClick={copyTeamId}
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3.5 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </SettingsCardBody>
            <SettingsCardFooter
              helperText="Used when interacting with the Multivrs API."
            />
          </SettingsCard>

          {/* Delete Team Card */}
          <SettingsCard danger>
            <SettingsCardBody
              title="Delete Team"
              description="The team will be permanently deleted, including its deployments, resources, and domains. This action is irreversible and can not be undone."
            />
            <SettingsCardFooter
              danger
              helperText="Careful, this action is irreversible."
              action={
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-md text-xs font-medium px-4"
                >
                  Delete Team
                </Button>
              }
            />
          </SettingsCard>
        </section>

        {/* Members Section */}
        <section id="members" className="scroll-mt-6 space-y-6">
          <TeamManager />
        </section>

        {/* Billing Section */}
        <section id="billing" className="scroll-mt-6 space-y-6">
          <BillingManager initial={billing} />
        </section>
      </div>
    </div>
  );
}

function TeamAvatarField({
  team,
  onChange,
}: {
  team: AccountTeam;
  onChange: (team: AccountTeam) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function upload(file: File) {
    setBusy(true);
    void squareImage(file)
      .then((image) => {
        const body = new FormData();
        body.set("file", image, "avatar.webp");
        return fetch("/api/team/avatar", {
          method: "POST",
          body,
        });
      })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg =
            errData.error?.message ||
            (typeof errData.error === "string" ? errData.error : errData.message) ||
            "Avatar upload failed";
          throw new Error(msg);
        }
        return res.json();
      })
      .then((updated) => {
        onChange(updated);
        toast.success("Team avatar updated");
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Avatar upload failed");
      })
      .finally(() => setBusy(false));
  }

  function remove() {
    setBusy(true);
    void fetch("/api/team/avatar", { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg =
            errData.error?.message ||
            (typeof errData.error === "string" ? errData.error : errData.message) ||
            "Failed to remove avatar";
          throw new Error(msg);
        }
        return res.json();
      })
      .then((updated) => {
        onChange(updated);
        toast.success("Team avatar removed");
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Failed to remove avatar");
      })
      .finally(() => setBusy(false));
  }

  return (
    <div className="relative group">
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="relative flex size-18 sm:size-20 shrink-0 cursor-pointer items-center justify-center rounded-full overflow-hidden shadow-md transition-transform group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title="Click to upload team avatar"
      >
        <TeamAvatar
          name={team.name}
          logo={team.logo}
          size={76}
          className="size-full"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="size-4 text-white" />
          <span className="mt-0.5 text-[9px] font-medium text-white">
            {busy ? "Uploading…" : "Upload"}
          </span>
        </div>
      </button>
      {team.logo && (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="mt-1 block w-full text-center text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}

async function squareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That file isn't an image we can read.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser can't resize images.");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    256,
    256,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The image couldn't be saved.")),
      "image/webp",
      0.9,
    ),
  );
}
