"use client";

import { DASH_FIELD } from "@/components/dashboard/menu";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveShieldCheck, LiveSmartphone } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { TwoFactorSetup } from "@/features/dashboard/components/account/auth/TwoFactorSetup";
import { useTwoFactor } from "@/features/dashboard/components/account/auth/useTwoFactor";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

/**
 * An authenticator app as a second step at sign-in. Password accounts confirm
 * their password to turn it on or off, as the auth server requires.
 */
export function TwoFactorCard({
  enabled,
  hasPassword,
}: {
  enabled: boolean;
  hasPassword: boolean;
}) {
  const {
    active,
    asking,
    setAsking,
    password,
    setPassword,
    enrollment,
    busy,
    reset,
    begin,
    verify,
    turnOff,
  } = useTwoFactor(enabled);
  const confirm = active ? turnOff : begin;
  return (
    <SettingsCard id="two-factor">
      <SettingsCardBody
        badge={
          <StatusOrb
            label={active ? "On" : "Off"}
            pill
            tone={active ? "ready" : "idle"}
          />
        }
        description="After your password or provider, enter a code from an authenticator app."
        icon={LiveShieldCheck}
        title="Two-factor authentication"
      >
        <div className="flex flex-wrap items-center gap-3" data-icon-trigger>
          <span className="surface-inset grid size-9 place-items-center rounded-tile text-muted-foreground">
            <LiveSmartphone className="size-4" strokeWidth={1.75} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">
            {active
              ? "Authenticator app is set up."
              : enrollment
                ? "Finish the steps below."
                : "Works with 1Password, Google Authenticator, Authy and others."}
          </p>
          {enrollment ? null : asking && hasPassword ? (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                confirm();
              }}
            >
              <input
                aria-label="Your password"
                autoComplete="current-password"
                className={cn(DASH_FIELD, "w-52 border px-3")}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Confirm your password"
                required
                type="password"
                value={password}
              />
              <Button
                disabled={busy || !password}
                size="sm"
                type="submit"
                variant={active ? "danger" : "hero"}
              >
                {busy ? "Working…" : active ? "Turn off" : "Continue"}
              </Button>
              <Button onClick={reset} size="sm" type="button" variant="quiet">
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              disabled={busy}
              onClick={() => (hasPassword ? setAsking(true) : confirm())}
              size="sm"
              variant={active ? "quiet" : "raised"}
            >
              {busy ? "Working…" : active ? "Turn off" : "Set up"}
            </Button>
          )}
        </div>
        {enrollment ? (
          <TwoFactorSetup
            busy={busy}
            enrollment={enrollment}
            onCancel={reset}
            onVerify={verify}
          />
        ) : null}
      </SettingsCardBody>
    </SettingsCard>
  );
}
