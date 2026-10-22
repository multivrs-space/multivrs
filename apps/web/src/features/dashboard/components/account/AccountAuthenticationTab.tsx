"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Fingerprint,
  KeyRound,
  Mail,
  Monitor,
  MoreHorizontal,
  Plus,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { describeDevice } from "@/features/dashboard/lib/describe-device";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import type {
  AccountPasskey,
  AccountSession,
  AccountSignIn,
} from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";
import { createdApiTokenSchema } from "@/lib/schemas/api-token.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

interface AccountAuthenticationTabProps {
  signIn: AccountSignIn;
  email: string;
  twoFactorEnabled?: boolean;
  tokens?: ApiTokenSummary[];
}

interface Enrollment {
  backupCodes: string[];
  secret: string;
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

function relativeTime(iso: string): string {
  const elapsed = new Date(iso).getTime() - Date.now();
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(elapsed) >= size) {
      return format.format(Math.round(elapsed / size), unit);
    }
  }
  return "just now";
}

export function AccountAuthenticationTab({
  signIn,
  email,
  twoFactorEnabled = false,
  tokens: initialTokens = [],
}: AccountAuthenticationTabProps) {
  const router = useRouter();

  // Social & Passkeys state
  const [busy, setBusy] = useState<string | null>(null);
  const [showMoreMethods, setShowMoreMethods] = useState(false);
  const [showPasskeysList, setShowPasskeysList] = useState(false);

  // Password state
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [passwordBusy, setPasswordBusy] = useState(false);

  // 2FA state
  const [isTwoFactorActive, setIsTwoFactorActive] = useState(twoFactorEnabled);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [mfaPassword, setMfaPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [mfaLoading, setMfaLoading] = useState(false);

  // Developer Tokens state
  const [apiTokens, setApiTokens] = useState<ApiTokenSummary[]>(initialTokens);
  const [tokenName, setTokenName] = useState("My CLI");
  const [createdTokenSecret, setCreatedTokenSecret] = useState<string | null>(null);
  const [creatingToken, setCreatingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // --- Real Auth Actions ---

  // Connect Social Account (Google / GitHub)
  const handleConnectSocial = (provider: "google" | "github") => {
    setBusy(`connect-${provider}`);
    void authClient
      .linkSocial({
        provider,
        callbackURL: "/account/settings?tab=authentication",
      })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? `Could not connect ${provider}.`);
          setBusy(null);
        }
      })
      .catch(() => {
        toast.error(`Could not connect ${provider}.`);
        setBusy(null);
      });
  };

  // Disconnect Social Account
  const handleDisconnectSocial = (provider: "google" | "github") => {
    const totalMethods =
      signIn.connected.length +
      (signIn.hasPassword ? 1 : 0) +
      (signIn.passkeys?.length ?? 0);

    if (totalMethods <= 1) {
      toast.error("Add another sign-in method before disconnecting this one.");
      return;
    }

    setBusy(`disconnect-${provider}`);
    void authClient
      .unlinkAccount({ providerId: provider })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? `Could not disconnect ${provider}.`);
          return;
        }
        toast.success(
          `${provider === "google" ? "Google" : "GitHub"} disconnected.`,
        );
        router.refresh();
      })
      .catch(() => toast.error(`Could not disconnect ${provider}.`))
      .finally(() => setBusy(null));
  };

  // Add Passkey via WebAuthn
  const handleAddPasskey = () => {
    setBusy("add-passkey");
    void authClient.passkey
      .addPasskey({ name: describeDevice(navigator.userAgent).label })
      .then((result) => {
        if (result?.error) {
          toast.error(result.error.message ?? "The passkey couldn't be added.");
          return;
        }
        toast.success("Passkey registered. You can now use it to sign in.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be added."))
      .finally(() => setBusy(null));
  };

  // Remove Passkey
  const handleRemovePasskey = (passkeyId: string) => {
    setBusy(`remove-passkey-${passkeyId}`);
    void authClient.passkey
      .deletePasskey({ id: passkeyId })
      .then((result) => {
        if (result?.error) {
          toast.error(result.error.message ?? "The passkey couldn't be removed.");
          return;
        }
        toast.success("Passkey removed.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be removed."))
      .finally(() => setBusy(null));
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 8) return;
    setPasswordBusy(true);
    void authClient
      .changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: signOutOthers,
      })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "Password could not be changed.");
          return;
        }
        toast.success("Password changed successfully.");
        setChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        router.refresh();
      })
      .catch(() => toast.error("Password could not be changed."))
      .finally(() => setPasswordBusy(false));
  };

  // Begin TOTP Setup
  const handleBeginTotp = () => {
    setMfaLoading(true);
    void authClient.twoFactor
      .enable({ issuer: "Multivrs", password: mfaPassword || undefined })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "MFA enrollment failed.");
          return;
        }
        const uri = new URL(result.data.totpURI);
        setEnrollment({
          backupCodes: result.data.backupCodes,
          secret: uri.searchParams.get("secret") ?? "",
        });
        setShowTotpSetup(true);
      })
      .catch(() => toast.error("MFA enrollment failed."))
      .finally(() => setMfaLoading(false));
  };

  // Confirm TOTP Code
  const handleConfirmTotp = () => {
    if (!totpCode.trim()) return;
    setMfaLoading(true);
    void authClient.twoFactor
      .verifyTotp({ code: totpCode.trim() })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "The authenticator code is invalid.");
          return;
        }
        setIsTwoFactorActive(true);
        setShowTotpSetup(false);
        setEnrollment(undefined);
        setTotpCode("");
        toast.success("Two-Factor Authentication is now active.");
        router.refresh();
      })
      .catch(() => toast.error("MFA verification failed."))
      .finally(() => setMfaLoading(false));
  };

  // Disable TOTP
  const handleDisableTotp = () => {
    setMfaLoading(true);
    void authClient.twoFactor
      .disable({ password: mfaPassword || undefined })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "Could not disable 2FA.");
          return;
        }
        setIsTwoFactorActive(false);
        setShowTotpSetup(false);
        setEnrollment(undefined);
        toast.success("Two-Factor Authentication disabled.");
        router.refresh();
      })
      .catch(() => toast.error("Could not disable 2FA."))
      .finally(() => setMfaLoading(false));
  };

  // Sign out individual session
  const handleSignOutSession = (sessionId: string, token: string) => {
    setBusy(`session-${sessionId}`);
    void authClient
      .revokeSession({ token })
      .then((result) => {
        if (result.error) {
          toast.error("That session couldn't be signed out.");
          return;
        }
        toast.success("Session signed out.");
        router.refresh();
      })
      .catch(() => toast.error("That session couldn't be signed out."))
      .finally(() => setBusy(null));
  };

  // Sign out all other sessions
  const handleSignOutOtherSessions = () => {
    setBusy("session-others");
    void authClient
      .revokeOtherSessions()
      .then((result) => {
        if (result.error) {
          toast.error("Could not sign out other sessions.");
          return;
        }
        toast.success("Signed out of all other sessions.");
        router.refresh();
      })
      .catch(() => toast.error("Could not sign out other sessions."))
      .finally(() => setBusy(null));
  };

  // Create Developer Token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim() || creatingToken) return;
    setCreatingToken(true);
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: tokenName.trim() }),
      });
      if (!response.ok) throw new Error();
      const data = createdApiTokenSchema.parse(await response.json());
      setApiTokens((prev) => [data.apiToken, ...prev]);
      setCreatedTokenSecret(data.token);
      setTokenName("My CLI");
      toast.success("Developer token created");
    } catch {
      toast.error("Failed to create developer token");
    } finally {
      setCreatingToken(false);
    }
  };

  // Revoke Developer Token
  const handleRevokeToken = async (id: string) => {
    try {
      const response = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setApiTokens((prev) => prev.filter((t) => t.id !== id));
      toast.success("Developer token revoked");
    } catch {
      toast.error("Failed to revoke token");
    }
  };

  const isGoogleConnected = signIn.connected.includes("google");
  const isGitHubConnected = signIn.connected.includes("github");
  const otherSessions = signIn.sessions.filter((s) => !s.current);

  return (
    <div className="space-y-6">
      {/* 1. Sign-in Methods Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Sign-in Methods"
          description="Customize how you access your account. Link your Git profiles and set up passkeys for seamless, secure authentication."
        >
          <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
            {/* Email */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="size-4 shrink-0 text-zinc-400" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">Email</div>
                  <div className="text-xs text-zinc-400 truncate">{email}</div>
                </div>
              </div>
              <Link
                href="/account/settings"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200",
                )}
              >
                Manage
              </Link>
            </div>

            {/* Password */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <KeyRound className="size-4 shrink-0 text-zinc-400" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">Password</div>
                    <div className="text-xs text-zinc-400">
                      {signIn.hasPassword
                        ? "Sign in with your email and password."
                        : "No password set. You sign in with social login or passkeys."}
                    </div>
                  </div>
                </div>
                {signIn.hasPassword && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    onClick={() => setChangingPassword(!changingPassword)}
                  >
                    {changingPassword ? "Cancel" : "Change Password"}
                  </Button>
                )}
              </div>

              {changingPassword && (
                <form onSubmit={handleChangePassword} className="mt-3.5 pt-3 border-t border-zinc-800/80 max-w-sm space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-300">Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-8 text-xs bg-zinc-950 border-zinc-800 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-300">New Password (min 8 chars)</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      minLength={8}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 text-xs bg-zinc-950 border-zinc-800 mt-1"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sign-out-others"
                      checked={signOutOthers}
                      onChange={(e) => setSignOutOthers(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900"
                    />
                    <label htmlFor="sign-out-others" className="text-xs text-zinc-400 cursor-pointer">
                      Sign out of other devices
                    </label>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={passwordBusy || !currentPassword || newPassword.length < 8}
                    className="h-7 text-xs bg-white text-black hover:bg-zinc-200"
                  >
                    {passwordBusy ? "Updating…" : "Update Password"}
                  </Button>
                </form>
              )}
            </div>

            {/* Passkeys */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Fingerprint className="size-4 shrink-0 text-zinc-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Passkeys</div>
                    <div className="text-xs text-zinc-400">
                      {signIn.passkeys && signIn.passkeys.length > 0
                        ? `${signIn.passkeys.length} passkey${signIn.passkeys.length > 1 ? "s" : ""} registered`
                        : "No passkeys registered"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {signIn.passkeys && signIn.passkeys.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-zinc-400 hover:text-white"
                      onClick={() => setShowPasskeysList(!showPasskeysList)}
                    >
                      {showPasskeysList ? "Hide" : "View"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    disabled={busy === "add-passkey"}
                    onClick={handleAddPasskey}
                  >
                    <Plus className="size-3 mr-1" />
                    {busy === "add-passkey" ? "Prompting device…" : "Add"}
                  </Button>
                </div>
              </div>

              {/* Passkeys List */}
              {showPasskeysList && signIn.passkeys && signIn.passkeys.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80 divide-y divide-zinc-800/60">
                  {signIn.passkeys.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{p.name || p.provider || "Passkey"}</div>
                        {p.createdAt && (
                          <div className="text-[11px] text-zinc-500">
                            Added {new Date(p.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy === `remove-passkey-${p.id}`}
                        onClick={() => handleRemovePasskey(p.id)}
                        className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2"
                      >
                        {busy === `remove-passkey-${p.id}` ? "Removing…" : "Remove"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Google */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex size-5 shrink-0 items-center justify-center font-bold text-sm text-blue-400">
                  G
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">Google</div>
                  <div className="text-xs text-zinc-400 truncate">
                    {isGoogleConnected ? email : "Not connected"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isGoogleConnected ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="size-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 p-1">
                      <DropdownMenuItem
                        className="text-xs cursor-pointer text-red-400 hover:text-red-300"
                        onClick={() => handleDisconnectSocial("google")}
                      >
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === "connect-google"}
                    onClick={() => handleConnectSocial("google")}
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                  >
                    {busy === "connect-google" ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <svg className="size-5 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">GitHub</div>
                  <div className="text-xs text-zinc-400 truncate">
                    {isGitHubConnected ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isGitHubConnected ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="size-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 p-1">
                      <DropdownMenuItem
                        className="text-xs cursor-pointer text-red-400 hover:text-red-300"
                        onClick={() => handleDisconnectSocial("github")}
                      >
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === "connect-github"}
                    onClick={() => handleConnectSocial("github")}
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                  >
                    {busy === "connect-github" ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </div>
            </div>

            {/* More options collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setShowMoreMethods(!showMoreMethods)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronRight
                    className={`size-3.5 transition-transform ${showMoreMethods ? "rotate-90" : ""}`}
                  />
                  <span>More options</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-xs">GitLab</span>
                  <span className="text-xs">Bitbucket</span>
                  <span className="text-xs">Apple</span>
                </div>
              </button>
              {showMoreMethods && (
                <div className="border-t border-zinc-800/60 px-4 py-3 bg-zinc-950/40 space-y-2">
                  {["GitLab", "Bitbucket", "Apple"].map((provider) => (
                    <div key={provider} className="flex items-center justify-between py-1">
                      <span className="text-xs text-zinc-300">{provider}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
                        onClick={() =>
                          toast.info(`${provider} OAuth is not configured on this server.`)
                        }
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* 2. Two-Factor Authentication Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Two-Factor Authentication"
          description="Protects your account by requiring a second factor at sign-in."
          aside={
            isTwoFactorActive ? (
              <span className="rounded-full bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-zinc-800/80 border border-zinc-700/80 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                Off
              </span>
            )
          }
        >
          <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
            {/* Authenticator App (TOTP) */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Smartphone className="size-4 shrink-0 text-zinc-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Authenticator App (TOTP)</div>
                    <div className="text-xs text-zinc-400">
                      {isTwoFactorActive ? "Enrolled" : "Not enrolled"}
                    </div>
                  </div>
                </div>
                {isTwoFactorActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    disabled={mfaLoading}
                    onClick={handleDisableTotp}
                  >
                    {mfaLoading ? "Disabling…" : "Disable"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    disabled={mfaLoading}
                    onClick={handleBeginTotp}
                  >
                    {mfaLoading ? "Generating…" : "Set up"}
                  </Button>
                )}
              </div>

              {/* TOTP Enrollment Drawer */}
              {showTotpSetup && enrollment && (
                <div className="mt-4 pt-3 border-t border-zinc-800 max-w-md space-y-3.5">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Authenticator Secret Key</div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs bg-zinc-950 p-2 rounded border border-zinc-800 text-zinc-300">
                      <span className="truncate flex-1">{enrollment.secret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(enrollment.secret);
                          toast.success("Secret copied");
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-zinc-200">Verification Code</div>
                    <div className="mt-1 flex gap-2">
                      <Input
                        maxLength={6}
                        placeholder="123456"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        className="h-8 text-xs font-mono bg-zinc-950 border-zinc-800 max-w-44"
                      />
                      <Button
                        size="sm"
                        disabled={mfaLoading || totpCode.trim().length !== 6}
                        onClick={handleConfirmTotp}
                        className="h-8 text-xs bg-white text-black hover:bg-zinc-200"
                      >
                        {mfaLoading ? "Verifying…" : "Confirm & Enable"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Passkeys 2FA */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Fingerprint className="size-4 shrink-0 text-zinc-400" />
                <div>
                  <div className="text-sm font-medium text-white">Passkeys</div>
                  <div className="text-xs text-zinc-400">
                    {signIn.passkeys && signIn.passkeys.length > 0
                      ? `${signIn.passkeys.length} registered passkey(s) can be used for 2FA`
                      : "No passkeys registered"}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                onClick={handleAddPasskey}
              >
                Add Passkey
              </Button>
            </div>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* 3. Developer Tokens (CLI & Machine Access) */}
      <SettingsCard>
        <SettingsCardBody
          title="Developer Tokens"
          description="Manage CLI and machine access to your account."
        >
          <div className="space-y-4">
            <form onSubmit={handleCreateToken} className="flex items-center gap-2 max-w-md">
              <Input
                placeholder="My CLI"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="h-9 text-xs bg-black/60 border-zinc-800 placeholder:text-zinc-600"
              />
              <Button
                type="submit"
                size="sm"
                disabled={creatingToken || !tokenName.trim()}
                className="h-9 px-3.5 text-xs bg-white text-black hover:bg-zinc-200 font-medium shrink-0"
              >
                <Plus className="size-3.5 mr-1" />
                {creatingToken ? "Creating…" : "Create"}
              </Button>
            </form>

            {/* Newly Created Token Display */}
            {createdTokenSecret && (
              <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-3 text-xs space-y-1.5">
                <div className="font-medium text-emerald-400">New Token Created</div>
                <div className="text-zinc-400 text-[11px]">
                  Copy this token now. It will not be shown again.
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    readOnly
                    value={createdTokenSecret}
                    className="h-8 font-mono text-xs bg-black/80 border-emerald-800/60 text-emerald-300 select-all"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-emerald-800/60 hover:bg-emerald-900/40 text-emerald-200 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTokenSecret);
                      setCopiedToken(true);
                      toast.success("Token copied to clipboard");
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                  >
                    {copiedToken ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span className="ml-1">{copiedToken ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Tokens List */}
            <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
              {apiTokens.length > 0 ? (
                apiTokens.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white">{t.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {t.hint ? `${t.hint}••••` : "Active token"} · Created{" "}
                        {new Date(t.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevokeToken(t.id)}
                      className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      Revoke
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No developer tokens active
                </div>
              )}
            </div>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* 4. Active Sessions (Machine / Device Sign-ins) */}
      <SettingsCard>
        <SettingsCardBody
          title="Active Sessions"
          description="Devices and machines currently signed in to your account. Sign out any you don't recognise."
          aside={
            otherSessions.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy === "session-others"}
                onClick={handleSignOutOtherSessions}
                className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
              >
                {busy === "session-others" ? "Signing out…" : "Sign out others"}
              </Button>
            ) : undefined
          }
        >
          <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
            {signIn.sessions.map((session) => {
              const device = describeDevice(session.userAgent);
              const Icon = device.mobile ? Smartphone : Monitor;
              return (
                <div key={session.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="size-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{device.label}</span>
                        {session.current && (
                          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[10px] text-zinc-300">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate" suppressHydrationWarning>
                        {[session.ipAddress, `Last active ${relativeTime(session.lastActiveAt)}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === `session-${session.id}`}
                      onClick={() => handleSignOutSession(session.id, session.token)}
                      className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                    >
                      {busy === `session-${session.id}` ? "Signing out…" : "Sign out"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </SettingsCardBody>
      </SettingsCard>

      {/* 5. Team Authentication Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Team Authentication"
          description="Authentication methods for connecting to your organization's teams. If any of your teams have SAML enabled you'll see them here to connect."
        />
        <SettingsCardFooter
          helperText={
            <span className="flex items-center gap-1">
              Learn more about{" "}
              <span className="text-zinc-300 underline underline-offset-4 cursor-pointer">
                SAML Single Sign-On ↗
              </span>
            </span>
          }
        />
      </SettingsCard>
    </div>
  );
}
