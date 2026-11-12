"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { GitHubRepositoryList } from "@/features/dashboard/components/GitHubRepositoryList";
import { useGithubRepositories } from "@/features/dashboard/hooks/useGithubRepositories";
import { useRepositoryFrameworks } from "@/features/dashboard/hooks/useRepositoryFrameworks";
import { authClient } from "@/lib/auth-client";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

interface RepositoryPickerProps {
  callbackURL: string;
  importingId: number | null;
  onImport: (repository: GitHubRepository) => void;
}

export function RepositoryPicker({
  callbackURL,
  importingId,
  onImport,
}: RepositoryPickerProps) {
  const github = useGithubRepositories();
  const frameworks = useRepositoryFrameworks(github.repositories);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const repositories = github.repositories.filter((repository) =>
    repository.name.toLowerCase().includes(needle),
  );

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
    <section className="overflow-hidden rounded-xl border border-(--hairline) bg-(--ink-raised)">
      <div className="flex flex-wrap items-center gap-2 border-b border-(--hairline) p-3">
        <div className="flex h-9 items-center gap-2 rounded-md border border-(--hairline) bg-foreground/[0.03] px-3 text-[13px] font-medium">
          <GitHubMark className="size-4" />
          {github.connected ? github.owner : "GitHub"}
        </div>
        <DashboardSearchInput
          containerClassName="min-w-48 flex-1"
          value={query}
          onValueChange={setQuery}
          placeholder="Search repositories"
          disabled={!github.connected && !github.loading}
        />
      </div>
      {!github.loading && !github.connected ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <GitHubMark className="size-7 text-foreground/70" />
          <h2 className="mt-4 text-sm font-semibold">
            Connect your GitHub account
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Multivrs lists the repositories you can access and redeploys on
            every push.
          </p>
          <Button type="button" size="sm" className="mt-5" onClick={connect}>
            Connect GitHub
          </Button>
        </div>
      ) : (
        <GitHubRepositoryList
          error={github.error}
          frameworks={frameworks}
          importingId={importingId}
          loading={github.loading}
          onImport={onImport}
          repositories={repositories}
        />
      )}
      {github.connected && !github.loading ? (
        <p className="border-t border-(--hairline) px-4 py-2.5 text-xs text-muted-foreground">
          {repositories.length} of {github.repositories.length} repositories ·
          Missing one?{" "}
          <button
            type="button"
            onClick={connect}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Update GitHub access
          </button>
        </p>
      ) : null}
    </section>
  );
}
