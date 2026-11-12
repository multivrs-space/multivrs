"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type {
  AccountSignIn,
  SocialProvider,
} from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

export const PROVIDER_NAMES: Record<SocialProvider, string> = {
  github: "GitHub",
  google: "Google",
};
const NAMES = PROVIDER_NAMES;

/** Linking and unlinking providers, never removing the last way in. */
export function useSocialLinks(signIn: AccountSignIn) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const methods =
    signIn.connected.length +
    (signIn.hasPassword ? 1 : 0) +
    (signIn.passkeys?.length ?? 0);

  function connect(provider: SocialProvider) {
    setBusy(provider);
    void authClient
      .linkSocial({
        provider,
        callbackURL: "/account/settings?tab=authentication",
      })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? `Could not connect ${NAMES[provider]}.`,
          );
          setBusy(null);
        }
      })
      .catch(() => {
        toast.error(`Could not connect ${NAMES[provider]}.`);
        setBusy(null);
      });
  }

  function disconnect(provider: SocialProvider) {
    if (methods <= 1)
      return void toast.error(
        "Add another way to sign in before disconnecting this one.",
      );
    setBusy(provider);
    void authClient
      .unlinkAccount({ providerId: provider })
      .then((result) => {
        if (result.error)
          return void toast.error(
            result.error.message ?? `Could not disconnect ${NAMES[provider]}.`,
          );
        toast.success(`${NAMES[provider]} disconnected.`);
        router.refresh();
      })
      .catch(() => toast.error(`Could not disconnect ${NAMES[provider]}.`))
      .finally(() => setBusy(null));
  }

  return { busy, connect, disconnect };
}
