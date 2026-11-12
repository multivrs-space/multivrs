"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LiveKeyRound, LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

/** Every developer token with when it was last used; revoke with a confirm. */
export function ApiTokenList({
  tokens,
  onRevoke,
}: {
  tokens: ApiTokenSummary[];
  onRevoke(id: string): void;
}) {
  const [revoking, setRevoking] = useState<ApiTokenSummary | null>(null);
  if (!tokens.length) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-8 text-[13px] text-muted-foreground"
        data-icon-trigger
      >
        <span className="surface-inset grid size-9 place-items-center rounded-tile">
          <LiveKeyRound className="size-4" strokeWidth={1.75} />
        </span>
        No developer tokens yet.
      </div>
    );
  }
  return (
    <div className="divide-y divide-hairline p-2">
      {tokens.map((token) => (
        <div
          className="flex items-center gap-3 rounded-tile px-3 py-3 transition-colors hover:bg-foreground/[0.025]"
          key={token.id}
        >
          <span className="surface-inset grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
            <LiveKeyRound className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium">{token.name}</p>
            <p className="mt-0.5 font-geist-mono text-[11.5px] text-muted-foreground">
              {token.hint}
            </p>
          </div>
          <span className="hidden text-[12px] text-muted-foreground sm:block">
            {token.lastUsedAt
              ? `Used ${relativeTime(String(token.lastUsedAt))}`
              : "Never used"}
          </span>
          <Button
            aria-label={`Revoke ${token.name}`}
            className="size-8"
            data-icon-trigger
            onClick={() => setRevoking(token)}
            size="icon-sm"
            variant="quiet"
          >
            <LiveTrash strokeWidth={1.75} />
          </Button>
        </div>
      ))}
      <ConfirmDialog
        confirmLabel="Revoke"
        description="Anything using this token, like a CLI or CI job, will stop working straight away."
        onConfirm={() => {
          if (revoking) onRevoke(revoking.id);
          setRevoking(null);
        }}
        onOpenChange={(open) => (open ? null : setRevoking(null))}
        open={revoking !== null}
        title={`Revoke ${revoking?.name ?? "token"}?`}
      />
    </div>
  );
}
