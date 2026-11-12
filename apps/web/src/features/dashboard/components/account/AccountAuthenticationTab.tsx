"use client";

import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import { PasskeysCard } from "@/features/dashboard/components/account/auth/PasskeysCard";
import { SessionsCard } from "@/features/dashboard/components/account/auth/SessionsCard";
import { SignInMethodsCard } from "@/features/dashboard/components/account/auth/SignInMethodsCard";
import { TwoFactorCard } from "@/features/dashboard/components/account/auth/TwoFactorCard";
import type { AccountSignIn } from "@/features/dashboard/types/account-security.types";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

interface AccountAuthenticationTabProps {
  signIn: AccountSignIn;
  email: string;
  twoFactorEnabled?: boolean;
  tokens?: ApiTokenSummary[];
}

/** How you get in and what's signed in: methods, passkeys, 2FA, sessions, tokens. */
export function AccountAuthenticationTab({
  signIn,
  email,
  twoFactorEnabled = false,
  tokens = [],
}: AccountAuthenticationTabProps) {
  return (
    <div className="space-y-3">
      <SignInMethodsCard email={email} signIn={signIn} />
      <PasskeysCard
        otherMethods={signIn.connected.length + (signIn.hasPassword ? 1 : 0)}
        passkeys={signIn.passkeys}
      />
      <TwoFactorCard
        enabled={twoFactorEnabled}
        hasPassword={signIn.hasPassword}
      />
      <SessionsCard sessions={signIn.sessions} />
      <div id="tokens">
        <ApiTokensPage embedded initialTokens={tokens} />
      </div>
    </div>
  );
}
