"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type PasskeyResult = Awaited<ReturnType<typeof authClient.signIn.passkey>>;

/**
 * Passkey sign-in two ways: the explicit button, and the browser offering a
 * saved passkey straight from the email field's autofill (conditional UI),
 * so signing in is one fingerprint or face scan, like Vercel or Shopify.
 */
export function usePasskeySignIn(
  returnTo: string,
  setLoading: (loading: boolean) => void,
) {
  const router = useRouter();

  function finish(result: PasskeyResult, quiet: boolean) {
    if (result?.error) {
      // Closing the system prompt, or typing instead, isn't worth reporting.
      const code = "code" in result.error ? String(result.error.code) : "";
      if (!quiet && !/CANCEL|ABORT|NOT_ALLOWED/i.test(code))
        toast.error(result.error.message || "Passkey sign-in failed.");
      return;
    }
    toast.success("Welcome back.");
    router.replace(returnTo);
    router.refresh();
  }

  // Starts once per visit; a later explicit sign-in replaces the pending one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: finish only reads stable values.
  useEffect(() => {
    let active = true;
    void window.PublicKeyCredential?.isConditionalMediationAvailable?.()
      .then((available) => {
        if (!available || !active) return;
        return authClient.signIn
          .passkey({ autoFill: true })
          .then((result) => active && finish(result, true));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return () => {
    setLoading(true);
    void authClient.signIn
      .passkey()
      .then((result) => finish(result, false))
      .catch(() => toast.error("Passkey sign-in failed. Please try again."))
      .finally(() => setLoading(false));
  };
}
