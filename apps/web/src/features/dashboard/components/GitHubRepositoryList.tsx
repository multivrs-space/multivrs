"use client";

import type { FrameworkId } from "@multivrs/config";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryIcon } from "@/features/dashboard/components/RepositoryIcon";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f"] as const;

interface GitHubRepositoryListProps {
  error?: string;
  /** Detected per repository; missing while detection is still running. */
  frameworks: Record<string, FrameworkId | null>;
  importingId: number | null;
  loading: boolean;
  onImport: (repository: GitHubRepository) => void;
  repositories: GitHubRepository[];
}

export function GitHubRepositoryList({
  error,
  frameworks,
  importingId,
  loading,
  onImport,
  repositories,
}: GitHubRepositoryListProps) {
  if (loading)
    return (
      <ul aria-busy="true" className="divide-y divide-(--hairline)">
        {SKELETON_ROWS.map((row) => (
          <li key={row} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    );
  if (!repositories.length)
    return (
      <p className="px-4 py-14 text-center text-sm text-muted-foreground">
        {error ?? "No repositories match your search."}
      </p>
    );
  return (
    <ul className="max-h-[560px] divide-y divide-(--hairline) overflow-y-auto">
      {repositories.map((repository) => (
        <li
          key={repository.id}
          className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03]"
        >
          <RepositoryIcon
            framework={frameworks[repository.full_name]}
            language={repository.language}
            name={repository.name}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">
                {repository.name}
              </span>
              {repository.private ? (
                <Lock
                  aria-label="Private repository"
                  className="size-3 shrink-0 text-muted-foreground"
                />
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {stackLabel(
                frameworks[repository.full_name],
                repository.language,
              )}
              Updated {relativeTime(repository.updated_at)}
            </p>
          </div>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={importingId !== null}
            onClick={() => onImport(repository)}
            className="border-(--hairline-strong) bg-transparent px-3"
          >
            {importingId === repository.id ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <>
                Import
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function stackLabel(
  framework: FrameworkId | null | undefined,
  language: string | null,
): string {
  const label = framework ? FRAMEWORK_LABELS[framework] : language;
  return label ? `${label} · ` : "";
}
