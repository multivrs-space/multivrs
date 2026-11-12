"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Enrollment } from "@/features/dashboard/components/account/auth/TwoFactorSetup";
import { authClient } from "@/lib/auth-client";

/** Two-factor state and the three calls that change it: enable, verify, disable. */
export function useTwoFactor(enabled: boolean) {
  const router = useRouter();
  const [active, setActive] = useState(enabled);
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [busy, setBusy] = useState(false);
  const reset = () => {
    setAsking(false);
    setPassword("");
    setEnrollment(undefined);
  };

  function begin() {
    setBusy(true);
    void authClient.twoFactor
      .enable({ issuer: "Multivrs", password: password || undefined })
      .then((result) => {
        if (result.error)
          return void toast.error(
            result.error.message ?? "Two-factor setup failed.",
          );
        const uri = result.data.totpURI;
        setEnrollment({
          uri,
          secret: new URL(uri).searchParams.get("secret") ?? "",
          backupCodes: result.data.backupCodes,
        });
        setAsking(false);
      })
      .catch(() => toast.error("Two-factor setup failed."))
      .finally(() => setBusy(false));
  }

  function verify(code: string) {
    setBusy(true);
    void authClient.twoFactor
      .verifyTotp({ code })
      .then((result) => {
        if (result.error)
          return void toast.error(
            result.error.message ??
              "That code didn't match. Try the newest one.",
          );
        setActive(true);
        reset();
        toast.success("Two-factor authentication is on.");
        router.refresh();
      })
      .catch(() => toast.error("That code couldn't be checked."))
      .finally(() => setBusy(false));
  }

  function turnOff() {
    setBusy(true);
    void authClient.twoFactor
      .disable({ password: password || undefined })
      .then((result) => {
        if (result.error)
          return void toast.error(
            result.error.message ?? "Two-factor couldn't be turned off.",
          );
        setActive(false);
        reset();
        toast.success("Two-factor authentication is off.");
        router.refresh();
      })
      .catch(() => toast.error("Two-factor couldn't be turned off."))
      .finally(() => setBusy(false));
  }

  return {
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
  };
}
