"use client";

import Link from "next/link";
import { useState } from "react";
import { LiveKeyRound, LiveLock, LiveMail } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  MethodRow,
  ProviderMark,
} from "@/features/dashboard/components/account/auth/MethodRow";
import { PasswordForm } from "@/features/dashboard/components/account/auth/PasswordForm";
import {
  PROVIDER_NAMES as NAMES,
  useSocialLinks,
} from "@/features/dashboard/components/account/auth/useSocialLinks";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import type { AccountSignIn } from "@/features/dashboard/types/account-security.types";

/** Every way into the account: email, password and the providers on offer. */
export function SignInMethodsCard({
  signIn,
  email,
}: {
  signIn: AccountSignIn;
  email: string;
}) {
  const [changing, setChanging] = useState(false);
  const { busy, connect, disconnect } = useSocialLinks(signIn);

  return (
    <SettingsCard id="sign-in">
      <SettingsCardBody
        description="Keep at least two, so losing one never locks you out."
        icon={LiveLock}
        title="Sign-in methods"
      >
        <ul className="divide-y divide-hairline">
          <MethodRow
            detail={email}
            icon={<LiveMail className="size-4" strokeWidth={1.75} />}
            title="Email"
          >
            <Link
              className={buttonVariants({ size: "sm", variant: "quiet" })}
              href="/account/settings?tab=settings"
            >
              Manage
            </Link>
          </MethodRow>
          <MethodRow
            below={
              changing ? (
                <PasswordForm onDone={() => setChanging(false)} />
              ) : null
            }
            detail={
              signIn.hasPassword
                ? "Sign in with your email and password."
                : "No password set. You sign in with a provider or a passkey."
            }
            icon={<LiveKeyRound className="size-4" strokeWidth={1.75} />}
            title="Password"
          >
            {signIn.hasPassword ? (
              <Button
                onClick={() => setChanging((value) => !value)}
                size="sm"
                variant="quiet"
              >
                {changing ? "Cancel" : "Change"}
              </Button>
            ) : null}
          </MethodRow>
          {signIn.available.map((provider) => {
            const connected = signIn.connected.includes(provider);
            return (
              <MethodRow
                detail={connected ? "Connected" : "Not connected"}
                icon={<ProviderMark provider={provider} />}
                key={provider}
                title={NAMES[provider]}
              >
                <Button
                  disabled={busy === provider}
                  onClick={() =>
                    connected ? disconnect(provider) : connect(provider)
                  }
                  size="sm"
                  variant={connected ? "quiet" : "raised"}
                >
                  {busy === provider
                    ? connected
                      ? "Disconnecting…"
                      : "Connecting…"
                    : connected
                      ? "Disconnect"
                      : "Connect"}
                </Button>
              </MethodRow>
            );
          })}
        </ul>
      </SettingsCardBody>
    </SettingsCard>
  );
}
