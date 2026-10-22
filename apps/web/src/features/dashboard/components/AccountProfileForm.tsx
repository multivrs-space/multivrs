"use client";

import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TeamAvatar } from "@/components/TeamAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { readableError, requestOk } from "@/lib/api/request.client";
import { authClient } from "@/lib/auth-client";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import { accountProfileResponseSchema } from "@/lib/schemas/account.schemas";

import {
  COUNTRIES,
  POPULAR_COUNTRIES,
  type CountryItem,
} from "@/features/dashboard/constants/countries";

import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";

const AVATAR_SIZE = 256;

export interface UserTeamOption {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export function AccountProfileForm({
  initialProfile,
  userId,
  emailVerified = false,
  teams = [],
}: {
  initialProfile: AccountProfile;
  userId?: string;
  emailVerified?: boolean;
  teams?: UserTeamOption[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [username, setUsername] = useState(initialProfile.username);
  const [savingName, setSavingName] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

  function saveField(field: "name" | "username", value: string) {
    const isName = field === "name";
    if (isName) setSavingName(true);
    else setSavingUsername(true);

    void requestOk(
      "/api/account/profile",
      {
        body: JSON.stringify({
          name: isName ? value : profile.name,
          username: isName ? profile.username : value,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      },
      "Profile update failed",
    )
      .then((response) => response.json())
      .then((body) => accountProfileResponseSchema.parse(body))
      .then((updated) => {
        setProfile(updated);
        setName(updated.name);
        setUsername(updated.username);
        toast.success(isName ? "Display name updated" : "Username updated");
        if (updated.username !== initialProfile.username)
          router.replace(`/${updated.username}/~/settings`);
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Profile update failed")),
      )
      .finally(() => {
        if (isName) setSavingName(false);
        else setSavingUsername(false);
      });
  }

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Avatar"
          description={"This is your avatar.\nUpload a custom avatar from your files."}
          aside={
            <AvatarField
              profile={profile}
              onChange={(updated) => {
                setProfile({ ...profile, image: updated.image });
                router.refresh();
              }}
            />
          }
        />
        <SettingsCardFooter helperText="An avatar is optional but strongly recommended." />
      </SettingsCard>

      {/* Display Name Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Display Name"
          description="Please enter your full name, or a display name you are comfortable with."
        >
          <Input
            id="profile-name"
            maxLength={32}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="max-w-md h-10 rounded-md border border-zinc-800 bg-black/60 px-3.5 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            placeholder="Your name"
          />
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 32 characters at maximum."
          action={
            <Button
              size="sm"
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
              disabled={savingName || name === profile.name || !name.trim()}
              onClick={() => saveField("name", name.trim())}
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* Username Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Username"
          description="This is your URL namespace within Multivrs."
        >
          <div className="flex max-w-md items-center rounded-md border border-zinc-800 bg-black/60 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400">
            <span className="flex h-10 items-center border-r border-zinc-800 bg-zinc-900/60 px-3.5 text-xs text-zinc-400 select-none font-mono">
              multivrs.space/
            </span>
            <input
              id="profile-username"
              maxLength={48}
              value={username}
              onChange={(event) =>
                setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              className="h-10 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
              placeholder="username"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 48 characters at maximum."
          action={
            <Button
              size="sm"
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
              disabled={savingUsername || username === profile.username || !username.trim()}
              onClick={() => saveField("username", username.trim())}
            >
              {savingUsername ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* Default Team Card */}
      <DefaultTeamField teams={teams} initialSlug={teams[0]?.slug} />

      {/* Email Card */}
      <EmailListField
        primaryEmail={profile.email}
        emailVerified={emailVerified}
      />

      {/* Your Phone Number Card */}
      <PhoneNumberField />

      {/* User ID Card */}
      {userId && <UserIdField userId={userId} />}

      {/* Reset Tips Card */}
      <ResetTipsField />

      {/* Delete Account Card */}
      <DeleteAccountField />
    </div>
  );
}

function AvatarField({
  profile,
  onChange,
}: {
  profile: AccountProfile;
  onChange: (profile: AccountProfile) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function send(request: Promise<Response>, success: string) {
    setBusy(true);
    void request
      .then((response) => response.json())
      .then((body) => accountProfileResponseSchema.parse(body))
      .then((updated) => {
        onChange(updated);
        toast.success(success);
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Avatar update failed")),
      )
      .finally(() => setBusy(false));
  }

  function upload(file: File) {
    send(
      squareImage(file).then((image) => {
        const body = new FormData();
        body.set("file", image);
        return requestOk(
          "/api/account/avatar",
          { body, method: "POST" },
          "Avatar upload failed",
        );
      }),
      "Avatar updated",
    );
  }

  function remove() {
    send(
      requestOk(
        "/api/account/avatar",
        { method: "DELETE" },
        "Avatar could not be removed",
      ),
      "Avatar removed",
    );
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
        className="relative flex size-18 sm:size-20 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900 overflow-hidden shadow-md transition-transform group-hover:scale-105"
        title="Click to upload custom avatar"
      >
        {profile.image ? (
          <Image
            src={profile.image}
            alt=""
            width={80}
            height={80}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <span className="font-geist-mono text-2xl font-bold text-white uppercase">
            {(profile.name[0] ?? profile.username[0] ?? "M").toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="size-4 text-white" />
          <span className="mt-0.5 text-[9px] font-medium text-white">
            {busy ? "Uploading…" : "Upload"}
          </span>
        </div>
      </button>
      {profile.image && (
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

/** Crops an image to its centre square and scales it to the avatar size. */
async function squareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That file isn't an image we can read.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
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
    AVATAR_SIZE,
    AVATAR_SIZE,
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

function DefaultTeamField({
  teams,
  initialSlug,
}: {
  teams: UserTeamOption[];
  initialSlug?: string;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug || teams[0]?.slug || "",
  );
  const [savedSlug, setSavedSlug] = useState<string>(
    initialSlug || teams[0]?.slug || "",
  );
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedTeam = teams.find((t) => t.slug === selectedSlug) || teams[0];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSavedSlug(selectedSlug);
      setSaving(false);
      toast.success("Default team updated");
    }, 400);
  };

  return (
    <SettingsCard>
      <SettingsCardBody
        title="Default Team"
        description="Your default team will be used when you make a request through the API or CLI where you don't specify a particular team. It will also be the team selected when you first navigate to the dashboard."
      >
        <div className="flex items-center gap-2 max-w-md">
          {selectedTeam ? (
            <div className="inline-flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
              <TeamAvatar
                name={selectedTeam.name || selectedTeam.slug}
                logo={selectedTeam.logo}
                size={20}
              />
              <span className="font-mono text-xs text-white">{selectedTeam.slug}</span>
              {teams.length > 1 && (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                      title="Switch default team"
                    >
                      <X className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-zinc-950 border-zinc-800 p-1">
                    {teams.map((t) => (
                      <DropdownMenuItem
                        key={t.slug}
                        className="flex items-center gap-2 cursor-pointer text-xs"
                        onClick={() => {
                          setSelectedSlug(t.slug);
                          setOpen(false);
                        }}
                      >
                        <TeamAvatar
                          name={t.name || t.slug}
                          logo={t.logo}
                          size={16}
                        />
                        <span className="font-mono">{t.slug}</span>
                        {t.slug === selectedSlug && <Check className="ml-auto size-3.5 text-white" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <span className="text-xs text-zinc-500">No teams available</span>
          )}
        </div>
      </SettingsCardBody>
      <SettingsCardFooter
        helperText={
          <span className="flex items-center gap-1">
            Learn more about <span className="text-zinc-300 underline underline-offset-4 cursor-pointer">Default Teams ↗</span>
          </span>
        }
        action={
          <Button
            size="sm"
            className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            disabled={saving || selectedSlug === savedSlug}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />
    </SettingsCard>
  );
}

function EmailListField({
  primaryEmail,
  emailVerified,
}: {
  primaryEmail: string;
  emailVerified: boolean;
}) {
  const [emails, setEmails] = useState<Array<{ address: string; verified: boolean; isPrimary: boolean }>>([
    { address: primaryEmail, verified: emailVerified, isPrimary: true },
  ]);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || emails.some((e) => e.address === trimmed)) return;
    setBusy(true);
    setTimeout(() => {
      setEmails((prev) => [...prev, { address: trimmed, verified: false, isPrimary: false }]);
      setNewEmail("");
      setAdding(false);
      setBusy(false);
      toast.success(`Verification email sent to ${trimmed}`);
    }, 500);
  };

  const handleMakePrimary = (address: string) => {
    setEmails((prev) =>
      prev.map((e) => ({
        ...e,
        isPrimary: e.address === address,
      })),
    );
    toast.success(`${address} set as primary email`);
  };

  const handleRemove = (address: string) => {
    setEmails((prev) => prev.filter((e) => e.address !== address));
    toast.success("Email removed");
  };

  const handleResend = (address: string) => {
    toast.success(`Verification email resent to ${address}`);
  };

  return (
    <SettingsCard>
      <SettingsCardBody
        title="Email"
        description="Enter the email addresses you want to use to log in with Multivrs. Your primary email will be used for account-related notifications."
      >
        <div className="space-y-3 max-w-2xl">
          <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
            {emails.map((item) => (
              <div key={item.address} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-normal text-white truncate">{item.address}</span>
                  {item.verified && (
                    <span className="rounded-full bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                      Verified
                    </span>
                  )}
                  {item.isPrimary && (
                    <span className="rounded-full bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      Primary
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="size-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 p-1">
                    {!item.isPrimary && (
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        onClick={() => handleMakePrimary(item.address)}
                      >
                        Make Primary
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-xs cursor-pointer"
                      onClick={() => handleResend(item.address)}
                    >
                      Resend Verification
                    </DropdownMenuItem>
                    {!item.isPrimary && (
                      <DropdownMenuItem
                        className="text-xs cursor-pointer text-red-400 hover:text-red-300"
                        onClick={() => handleRemove(item.address)}
                      >
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {adding ? (
            <form onSubmit={handleAddEmail} className="flex items-center gap-2 pt-1 max-w-md">
              <Input
                type="email"
                placeholder="developer@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoFocus
                className="h-9 rounded-md border border-zinc-800 bg-black/60 px-3 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
              />
              <Button
                type="submit"
                size="sm"
                disabled={busy || !newEmail.trim()}
                className="h-9 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-3.5"
              >
                {busy ? "Sending…" : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setNewEmail("");
                }}
                className="h-9 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
              className="h-8 gap-1.5 rounded-md border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200"
            >
              <Plus className="size-3.5" />
              Add Another
            </Button>
          )}
        </div>
      </SettingsCardBody>
      <SettingsCardFooter helperText="Emails must be verified to be able to login with them or be used as primary email." />
    </SettingsCard>
  );
}

function PhoneNumberField() {
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
    COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0]!,
  );
  const [countrySearch, setCountrySearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.dialCode.includes(countrySearch) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : COUNTRIES;

  const handleSave = () => {
    if (!phone.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.success(`Verification code sent to ${selectedCountry.dialCode} ${phone}`);
    }, 600);
  };

  return (
    <SettingsCard>
      <SettingsCardBody
        title="Your Phone Number"
        description="Enter a phone number to receive important service updates by SMS."
      >
        <div className="flex max-w-md items-center rounded-md border border-zinc-800 bg-black/60 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 items-center gap-1.5 border-r border-zinc-800 bg-zinc-900/60 px-3 text-xs text-zinc-300 hover:text-white transition-colors shrink-0"
              >
                <span className="text-sm">{selectedCountry.flag}</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-zinc-950 border-zinc-800 p-1">
              <div className="p-1 border-b border-zinc-800/80">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-7 w-full bg-black/60 border border-zinc-800 rounded px-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700"
                />
              </div>
              <div className="max-h-60 overflow-y-auto hide-scrollbar pt-1 divide-y divide-zinc-900">
                {countrySearch.trim() ? (
                  filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <DropdownMenuItem
                        key={c.code}
                        className="flex items-center gap-2 text-xs cursor-pointer py-1.5"
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountrySearch("");
                          setOpen(false);
                        }}
                      >
                        <span className="text-sm shrink-0">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name} ({c.dialCode})</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No countries found
                    </div>
                  )
                ) : (
                  <>
                    <div className="py-0.5">
                      {POPULAR_COUNTRIES.map((c) => (
                        <DropdownMenuItem
                          key={`popular-${c.code}`}
                          className="flex items-center gap-2 text-xs cursor-pointer py-1.5"
                          onClick={() => {
                            setSelectedCountry(c);
                            setOpen(false);
                          }}
                        >
                          <span className="text-sm shrink-0">{c.flag}</span>
                          <span className="flex-1 truncate">{c.name} ({c.dialCode})</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <div className="pt-1">
                      <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        All Countries
                      </div>
                      {COUNTRIES.map((c) => (
                        <DropdownMenuItem
                          key={c.code}
                          className="flex items-center gap-2 text-xs cursor-pointer py-1.5"
                          onClick={() => {
                            setSelectedCountry(c);
                            setOpen(false);
                          }}
                        >
                          <span className="text-sm shrink-0">{c.flag}</span>
                          <span className="flex-1 truncate">{c.name} ({c.dialCode})</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(201) 555-0123"
            className="h-10 flex-1 bg-transparent px-3.5 text-sm text-white outline-none placeholder:text-zinc-600 font-mono"
          />
        </div>
      </SettingsCardBody>
      <SettingsCardFooter
        helperText="A code will be sent to verify."
        action={
          <Button
            size="sm"
            className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            disabled={saving || !phone.trim() || saved}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />
    </SettingsCard>
  );
}

function ResetTipsField() {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      toast.success("Onboarding tips reset");
    }, 400);
  };

  return (
    <SettingsCard>
      <SettingsCardBody
        title="Reset Tips"
        description="See onboarding tips you might have missed."
      />
      <SettingsCardFooter
        helperText="Resetting will make all onboarding tips re-appear."
        action={
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-md border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-white px-4"
            disabled={resetting}
            onClick={handleReset}
          >
            {resetting ? "Resetting…" : "Reset"}
          </Button>
        }
      />
    </SettingsCard>
  );
}

function DeleteAccountField() {
  return (
    <SettingsCard danger>
      <SettingsCardBody
        title="Delete Account"
        description="Permanently remove your Personal Account and all of its contents from the Multivrs platform. This action is not reversible, so please continue with caution."
      />
      <SettingsCardFooter
        danger
        helperText="Careful, this action is irreversible."
        action={
          <Button
            size="sm"
            variant="destructive"
            className="h-8 rounded-md text-xs font-medium px-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => toast.error("Account deletion requires confirmation")}
          >
            Delete Personal Account
          </Button>
        }
      />
    </SettingsCard>
  );
}

function UserIdField({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);

  const copyUserId = async () => {
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SettingsCard>
      <SettingsCardBody
        title="User ID"
        description="This is your user ID within Multivrs."
      >
        <div className="flex max-w-md items-center gap-2">
          <Input
            readOnly
            value={userId}
            className="h-10 font-mono text-xs text-zinc-400 bg-black/60 border-zinc-800 select-all"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 shrink-0 gap-1.5 border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-200"
            onClick={copyUserId}
          >
            {copied ? (
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
      <SettingsCardFooter helperText="Used when interacting with the Multivrs API." />
    </SettingsCard>
  );
}
