"use client";

import type { FrameworkId } from "@multivrs/config";
import { Spinner } from "@/components/dashboard/Spinner";
import { LiveChevronRight, LiveLock } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
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
      <ul aria-busy="true" className="space-y-1 p-2 pt-3">
        {SKELETON_ROWS.map((row) => (
          <li className="flex items-center gap-3 px-3 py-2.5" key={row}>
            <span className="skeleton size-8 rounded-[9px]" />
            <span className="flex-1 space-y-2">
              <span className="skeleton block h-3 w-40" />
              <span className="skeleton block h-2.5 w-28" />
            </span>
            <span className="skeleton h-8 w-20 rounded-full" />
          </li>
        ))}
      </ul>
    );
  if (!repositories.length)
    return (
      <p className="px-5 py-16 text-center text-[13px] text-muted-foreground">
        {error ?? "No repositories match your search."}
      </p>
    );
  return (
    <ul className="max-h-[min(560px,60vh)] space-y-0.5 overflow-y-auto p-2 pt-3">
      {repositories.map((repository) => {
        const framework = frameworks[repository.full_name];
        const importing = importingId === repository.id;
        return (
          <li
            className="group flex items-center gap-3 rounded-tile px-3 py-2.5 transition-colors hover:bg-foreground/[0.035]"
            key={repository.id}
          >
            <RepositoryIcon
              framework={framework}
              language={repository.language}
              name={repository.name}
            />
            <div className="min-w-0 flex-1">
              <p className="flex min-w-0 items-center gap-1.5 text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">
                <span className="truncate">{repository.name}</span>
                {repository.private ? (
                  <LiveLock
                    aria-label="Private repository"
                    className="size-3 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {stackLabel(framework, repository.language)}
                <time dateTime={repository.updated_at}>
                  updated {relativeTime(repository.updated_at)}
                </time>
              </p>
            </div>
            <Button
              aria-label={`Import ${repository.full_name}`}
              className="h-8 px-3.5 text-[12.5px]"
              data-icon-trigger
              disabled={importingId !== null}
              onClick={() => onImport(repository)}
              size="sm"
              type="button"
              variant={importing ? "hero" : "raised"}
            >
              {importing ? <Spinner className="size-3" /> : null}
              Import
              {importing ? null : (
                <LiveChevronRight className="size-3.5" strokeWidth={2} />
              )}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/** "Next.js · " once detected, else the repository's main language. */
function stackLabel(
  framework: FrameworkId | null | undefined,
  language: string | null,
): string {
  const label = framework ? FRAMEWORK_LABELS[framework] : language;
  return label ? `${label} · ` : "";
}
