"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveKeyRound,
  LivePlus,
  LiveShieldAlert,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiTokenList } from "@/features/dashboard/components/ApiTokenList";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { createdApiTokenSchema } from "@/lib/schemas/api-token.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

type CreatedToken = ReturnType<typeof createdApiTokenSchema.parse>;

async function requestToken(name: string): Promise<CreatedToken | null> {
  try {
    const response = await fetch("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      toast.error("Token creation failed");
      return null;
    }
    return createdApiTokenSchema.parse(await response.json());
  } catch {
    toast.error("Token creation failed");
    return null;
  }
}

export function ApiTokensPage({
  embedded = false,
  initialTokens,
}: {
  embedded?: boolean;
  initialTokens: ApiTokenSummary[];
}) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("My CLI");
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function createToken() {
    if (busy) return;
    setBusy(true);
    void requestToken(name).then((result) => {
      setBusy(false);
      if (result) {
        setTokens((current) => [result.apiToken, ...current]);
        setCreated(result.token);
      }
    });
  }

  async function revokeToken(id: string) {
    const response = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Token revocation failed");
    setTokens((current) => current.filter((token) => token.id !== id));
    toast.success("Token revoked");
  }

  return (
    <div
      className={
        embedded
          ? ""
          : "mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 lg:px-6 lg:py-6"
      }
    >
      {embedded ? null : (
        <DashboardPageHeader
          description="Tokens let the CLI and CI act on your account."
          title="Developer tokens"
        />
      )}
      <DashCard aria-label="Developer tokens">
        <DashCardHeader
          description="Tokens let the CLI and CI act as you"
          icon={LiveKeyRound}
          title="Developer tokens"
        />
        <div className="space-y-4 p-5 pt-4">
          <div className="flex max-w-xl gap-2">
            <Input
              aria-label="Token name"
              className={DASH_FIELD}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. CI or laptop CLI"
              value={name}
            />
            <Button
              data-icon-trigger
              disabled={busy || !name.trim()}
              onClick={createToken}
              size="sm"
              variant="hero"
            >
              <LivePlus strokeWidth={2} />
              Create
            </Button>
          </div>
          {created ? (
            <div
              className="max-w-2xl rounded-tile border border-amber-500/25 bg-amber-500/[0.06] p-3.5 duration-300 animate-in fade-in-0"
              data-icon-trigger
            >
              <p className="flex items-center gap-2 text-[12.5px] font-medium text-amber-800 dark:text-amber-200">
                <LiveShieldAlert className="size-4" strokeWidth={1.75} />
                Copy it now. You won't be able to see it again.
              </p>
              <div className="surface-inset mt-2.5 flex items-center gap-2 rounded-control py-1 pl-3 pr-1">
                <code className="min-w-0 flex-1 overflow-x-auto font-geist-mono text-[12px]">
                  {created}
                </code>
                <CopyButton className="size-7" text={created} />
              </div>
            </div>
          ) : null}
        </div>
        <ApiTokenList onRevoke={(id) => void revokeToken(id)} tokens={tokens} />
      </DashCard>
    </div>
  );
}
