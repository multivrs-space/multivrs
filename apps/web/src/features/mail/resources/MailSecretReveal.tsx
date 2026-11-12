"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LiveCopy, LiveShieldAlert } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";

export interface SmtpConnection {
  host: string;
  port: number;
  tls: boolean;
  username: string;
}

/** A new secret, shown once, with SMTP settings when it's a password. */
export function MailSecretReveal({
  secret,
  connection,
  onDone,
}: {
  secret: string;
  connection?: SmtpConnection;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const rows = connection
    ? [
        ["Host", connection.host],
        ["Port", `${connection.port} · TLS`],
        ["Username", connection.username],
      ]
    : [];
  async function copy() {
    const value = connection
      ? `SMTP_HOST=${connection.host}\nSMTP_PORT=${connection.port}\nSMTP_USERNAME=${connection.username}\nSMTP_PASSWORD=${secret}\nSMTP_TLS=true`
      : secret;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(connection ? "SMTP settings copied" : "Secret copied");
  }
  return (
    <div className="space-y-3">
      <p
        className="flex items-center gap-2 rounded-tile border border-amber-500/25 bg-amber-500/[0.06] p-3 text-[12.5px] text-amber-800 dark:text-amber-200"
        data-icon-trigger
      >
        <LiveShieldAlert className="size-4 shrink-0" strokeWidth={1.75} />
        Copy it now. You won't be able to see it again.
      </p>
      {rows.length ? (
        <dl className="surface-inset grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5 rounded-tile p-3.5 text-[12px]">
          {rows.map(([label, value]) => (
            <div className="contents" key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="break-all font-geist-mono text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <code className="surface-inset block select-all break-all rounded-tile p-3.5 font-geist-mono text-[12px] font-medium text-foreground">
        {secret}
      </code>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
        <Button
          className="sm:flex-1"
          data-icon-trigger
          onClick={() => void copy()}
          size="sm"
          variant="hero"
        >
          <LiveCopy strokeWidth={1.75} />
          {copied
            ? "Copied"
            : connection
              ? "Copy SMTP settings"
              : "Copy secret"}
        </Button>
        <Button
          className="sm:flex-1"
          onClick={onDone}
          size="sm"
          type="button"
          variant="raised"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
