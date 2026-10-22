"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { emailSchema } from "@/validators/auth.validators";

const labelClass =
  "font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground";
const inputClass =
  "h-11 rounded-lg border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus-visible:border-[#A855F7] focus-visible:ring-[#A855F7]/30";

/**
 * Request a password-reset link. On success we always show the same
 * confirmation screen (don't reveal whether an account exists).
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message);
      return;
    }

    setIsLoading(true);
    void authClient
      .requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })
      .then(() => {
        setIsLoading(false);
        setSent(true);
      })
      .catch(() => {
        toast.error("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      });
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10">
          <MailCheck className="size-5 text-[#A855F7]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-clash text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="text-foreground/80">{email}</span>, we&apos;ve sent a
            link to reset your password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-[#A855F7]"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(undefined);
            }}
            disabled={isLoading}
            aria-invalid={!!error}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-lg bg-[#A855F7] text-sm font-semibold text-foreground transition-colors hover:bg-[#9333ea] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Sending link…" : "Send reset link"}
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
