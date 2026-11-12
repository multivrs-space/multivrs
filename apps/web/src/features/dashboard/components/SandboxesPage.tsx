"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LivePlus,
  LiveSquareTerminal,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import {
  SandboxTerminal,
  type TerminalEntry,
} from "@/features/dashboard/components/sandboxes/SandboxTerminal";
import { requestOk } from "@/lib/api/request.client";
import {
  sandboxCommandResponseSchema,
  sandboxCreateResponseSchema,
} from "@/lib/schemas/sandbox.schemas";

/** An ephemeral container for this project: start it, run commands, end it. */
export function SandboxesPage({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [sandboxId, setSandboxId] = useState<string>();
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [busy, setBusy] = useState<
    "creating" | "running" | "destroying" | null
  >(null);

  function create() {
    if (busy) return;
    setBusy("creating");
    void requestOk(
      `/api/projects/${projectId}/sandboxes`,
      { method: "POST" },
      "Sandbox creation failed",
    )
      .then((response) => response.json())
      .then((body) => sandboxCreateResponseSchema.parse(body))
      .then((result) => setSandboxId(result.sandboxId))
      .catch(() =>
        toast.error(
          "The sandbox didn't start. Check the build worker configuration.",
        ),
      )
      .finally(() => setBusy(null));
  }

  function run(command: string) {
    if (!sandboxId || busy) return;
    setBusy("running");
    void requestOk(
      `/api/projects/${projectId}/sandboxes/${sandboxId}`,
      {
        body: JSON.stringify({ command }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Command failed",
    )
      .then((response) => response.json())
      .then((body) => sandboxCommandResponseSchema.parse(body))
      .then((result) =>
        setHistory((current) => [
          ...current,
          {
            id: `${current.length}-${command}`,
            command,
            output: [result.stdout, result.stderr].filter(Boolean).join("\n"),
          },
        ]),
      )
      .catch(() => toast.error("That command didn't run."))
      .finally(() => setBusy(null));
  }

  function destroy() {
    if (!sandboxId || busy) return;
    setBusy("destroying");
    void requestOk(
      `/api/projects/${projectId}/sandboxes/${sandboxId}`,
      { method: "DELETE" },
      "Destroy failed",
    )
      .then(() => {
        setSandboxId(undefined);
        setHistory([]);
        toast.success("Sandbox destroyed");
      })
      .catch(() => toast.error("Couldn't destroy the sandbox."))
      .finally(() => setBusy(null));
  }

  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          sandboxId ? (
            <Button
              data-icon-trigger
              disabled={busy !== null}
              onClick={destroy}
              size="sm"
              variant="danger"
            >
              <LiveTrash strokeWidth={1.75} />
              {busy === "destroying" ? "Destroying…" : "Destroy"}
            </Button>
          ) : null
        }
        description="A throwaway container with this project's code, for quick commands and checks."
        eyebrow={`${projectName} · Run`}
        title="Sandboxes"
      />
      {sandboxId ? (
        <DashCard aria-label="Sandbox terminal">
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
            <StatusOrb label="Running" pill tone="ready" />
            <span className="truncate font-geist-mono text-[12px] text-muted-foreground">
              {sandboxId}
            </span>
            <CopyButton className="size-7" text={sandboxId} />
          </div>
          <SandboxTerminal
            history={history}
            onRun={run}
            running={busy === "running"}
          />
        </DashCard>
      ) : (
        <DashCard>
          <EmptyState
            actions={
              <Button
                data-icon-trigger
                disabled={busy !== null}
                onClick={create}
                size="sm"
                variant="hero"
              >
                <LivePlus strokeWidth={2} />
                {busy === "creating" ? "Starting…" : "Create sandbox"}
              </Button>
            }
            description="Spin up an isolated container, run shell commands against your project, and throw it away when you're done."
            glyph={LiveSquareTerminal}
            title="No sandbox running"
          />
        </DashCard>
      )}
    </PageBody>
  );
}
