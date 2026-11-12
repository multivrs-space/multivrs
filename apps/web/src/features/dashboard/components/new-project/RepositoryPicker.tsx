"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LiveGitBranch, LiveKeyRound } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { GitHubRepositoryList } from "@/features/dashboard/components/new-project/GitHubRepositoryList";
import { useGithubRepositories } from "@/features/dashboard/hooks/useGithubRepositories";
import { useRepositoryFrameworks } from "@/features/dashboard/hooks/useRepositoryFrameworks";
import { authClient } from "@/lib/auth-client";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";
import { cn } from "@/lib/utils";

interface RepositoryPickerProps {
  callbackURL: string;
  className?: string;
  importingId: number | null;
  onImport: (repository: GitHubRepository) => void;
}

/** Every repository the connected GitHub account can reach, newest first. */
export function RepositoryPicker({
  callbackURL,
  className,
  importingId,
  onImport,
}: RepositoryPickerProps) {
  const github = useGithubRepositories();
  const frameworks = useRepositoryFrameworks(github.repositories);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const repositories = github.repositories.filter((repository) =>
    repository.full_name.toLowerCase().includes(needle),
  );
  const disconnected = !github.loading && !github.connected;

  async function connect() {
    try {
      await authClient.linkSocial({ callbackURL, provider: "github" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "GitHub connection failed",
      );
    }
  }

  return (
    <DashCard aria-label="Import from GitHub" className={className}>
      <DashCardHeader
        action={
          github.connected ? (
            <Button
              data-icon-trigger
              onClick={connect}
              size="sm"
              type="button"
              variant="quiet"
            >
              <LiveKeyRound strokeWidth={1.75} />
              Manage access
            </Button>
          ) : null
        }
        description={
          github.loading
            ? "Reading your repositories…"
            : github.connected
              ? `${github.owner ?? "GitHub"} · ${github.repositories.length} repositories`
              : "Not connected yet"
        }
        mark={<GitHubMark className="size-4" />}
        title="Import from GitHub"
      />
      {disconnected ? (
        <EmptyState
          actions={
            <Button onClick={connect} size="sm" type="button" variant="hero">
              <GitHubMark className="size-3.5" />
              Connect GitHub
            </Button>
          }
          description="Multivrs lists the repositories you choose to share, and builds again on every push."
          glyph={LiveGitBranch}
          title="Connect your GitHub account"
        />
      ) : (
        <>
          <div className="px-5 pt-4">
            <DashboardSearchInput
              clearable
              disabled={github.loading}
              onValueChange={setQuery}
              placeholder="Search repositories"
              value={query}
            />
          </div>
          <GitHubRepositoryList
            error={github.error}
            frameworks={frameworks}
            importingId={importingId}
            loading={github.loading}
            onImport={onImport}
            repositories={repositories}
          />
          <p
            className={cn(
              "border-t border-hairline px-5 py-3 text-xs text-muted-foreground",
              github.loading && "invisible",
            )}
          >
            {needle
              ? `${repositories.length} of ${github.repositories.length} match`
              : "Recently updated first."}{" "}
            Missing one?{" "}
            <button
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={connect}
              type="button"
            >
              Share more repositories
            </button>
          </p>
        </>
      )}
    </DashCard>
  );
}
