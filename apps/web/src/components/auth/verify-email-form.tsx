"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { normalizeAuthReturnPath } from "@/lib/auth/return-path";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;

/**
 * Email verification via 6-digit OTP (Better Auth `emailOTP` plugin). The email
 * is passed through as a query param; the code was sent on sign-up.
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const returnTo = normalizeAuthReturnPath(
    searchParams.get("from") ?? undefined,
  );

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verify = (code: string) => {
    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      return;
    }
    if (isVerifying) return;
    setIsVerifying(true);
    void authClient.emailOtp
      .verifyEmail({ email, otp: code })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message || "Invalid or expired code. Try again.");
          setOtp("");
          return;
        }
        toast.success("Email verified.");
        router.push(returnTo);
      })
      .catch(() => toast.error("Email verification failed. Try again."))
      .finally(() => setIsVerifying(false));
  };

  const handleChange = (value: string) => {
    setOtp(value);
    if (value.length === OTP_LENGTH && !isVerifying) {
      void verify(value);
    }
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      return;
    }
    if (isResending) return;
    setIsResending(true);
    void authClient.emailOtp
      .sendVerificationOtp({ email, type: "email-verification" })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message || "Could not resend the code.");
          return;
        }
        toast.success("A new code is on its way.");
      })
      .catch(() => toast.error("Could not resend the code."))
      .finally(() => setIsResending(false));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="text-foreground/80">{email || "your email"}</span>.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={OTP_LENGTH}
          value={otp}
          onChange={handleChange}
          disabled={isVerifying}
          autoFocus
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <InputOTPSlot
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP slots
                key={i}
                index={i}
                className="size-12 rounded-lg border-border bg-muted/40 text-lg text-foreground first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-[#A855F7] data-[active=true]:ring-[#A855F7]/30"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {isVerifying && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Verifying…
          </p>
        )}
      </div>

      <div className="space-y-3 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-muted-foreground transition-colors hover:text-[#A855F7] disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Didn't get it? Resend code"}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
