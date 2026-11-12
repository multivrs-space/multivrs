"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { Button } from "@/components/ui/button";
import { TotpQrCode } from "@/features/dashboard/components/account/auth/TotpQrCode";
import { cn } from "@/lib/utils";

export interface Enrollment {
  uri: string;
  secret: string;
  backupCodes: string[];
}

const STEP =
  "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-geist-mono text-[11px] font-semibold text-primary";

/** Three steps: add the key to an app, keep the backup codes, prove it works. */
export function TwoFactorSetup({
  enrollment,
  busy,
  onVerify,
  onCancel,
}: {
  enrollment: Enrollment;
  busy: boolean;
  onVerify: (code: string) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  return (
    <ol className="mt-4 space-y-5 sm:pl-12">
      <li className="flex gap-3">
        <span className={STEP}>1</span>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[13px] font-medium">
            Scan this with your authenticator app
          </p>
          <div className="flex flex-wrap items-start gap-4">
            <TotpQrCode uri={enrollment.uri} />
            <div className="min-w-0 max-w-xs flex-1 space-y-2">
              <p className="text-[12px] text-muted-foreground">
                Can't scan? Enter this key instead, or open the link on this
                device.
              </p>
              <div className="surface-inset flex items-center gap-2 rounded-control py-1 pl-3 pr-1">
                <code className="min-w-0 flex-1 truncate font-geist-mono text-[12px]">
                  {enrollment.secret}
                </code>
                <CopyButton className="size-7" text={enrollment.secret} />
              </div>
              <a
                className="inline-block text-[12.5px] font-medium text-primary underline-offset-4 hover:underline"
                href={enrollment.uri}
              >
                Open in authenticator app
              </a>
            </div>
          </div>
        </div>
      </li>
      <li className="flex gap-3">
        <span className={STEP}>2</span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-medium">Save your backup codes</p>
          <p className="text-[12px] text-muted-foreground">
            Each works once if you lose your phone. This is the only time
            they're shown.
          </p>
          <div className="surface-inset relative grid max-w-md grid-cols-2 gap-x-6 gap-y-1 rounded-tile p-3 pr-11 font-geist-mono text-[12.5px]">
            {enrollment.backupCodes.map((backup) => (
              <span key={backup}>{backup}</span>
            ))}
            <CopyButton
              className="absolute right-2 top-2 size-7"
              text={enrollment.backupCodes.join("\n")}
            />
          </div>
        </div>
      </li>
      <li className="flex gap-3">
        <span className={STEP}>3</span>
        <form
          className="min-w-0 flex-1 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim().length === 6) onVerify(code.trim());
          }}
        >
          <p className="text-[13px] font-medium">
            Enter the 6-digit code from the app
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              aria-label="Authenticator code"
              autoComplete="one-time-code"
              className={cn(
                DASH_FIELD,
                "w-36 border px-3 font-geist-mono tracking-[0.3em]",
              )}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              value={code}
            />
            <Button
              disabled={busy || code.length !== 6}
              size="sm"
              type="submit"
              variant="hero"
            >
              {busy ? "Checking…" : "Turn on"}
            </Button>
            <Button onClick={onCancel} size="sm" type="button" variant="quiet">
              Cancel
            </Button>
          </div>
        </form>
      </li>
    </ol>
  );
}
