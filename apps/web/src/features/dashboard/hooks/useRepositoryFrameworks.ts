"use client";

import type { FrameworkId } from "@multivrs/config";
import { useEffect, useState } from "react";
import {
  frameworkDetectionSchema,
  type GitHubRepository,
} from "@/lib/schemas/github.schemas";

/** Parallel detections; each costs the user two GitHub API calls. */
const CONCURRENCY = 4;
const STORAGE_PREFIX = "multivrs:framework:";

type Frameworks = Record<string, FrameworkId | null>;

/** Session cache keyed by the repository's last update, so pushes re-detect. */
function storageKey(repository: GitHubRepository): string {
  return `${STORAGE_PREFIX}${repository.full_name}@${repository.updated_at}`;
}

function readStored(
  repository: GitHubRepository,
): FrameworkId | null | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(repository));
    if (raw === null) return undefined;
    return frameworkDetectionSchema.shape.framework.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function store(repository: GitHubRepository, framework: FrameworkId | null) {
  try {
    sessionStorage.setItem(storageKey(repository), JSON.stringify(framework));
  } catch {
    // Storage can be full or blocked; detection simply runs again next visit.
  }
}

async function detect(
  repository: GitHubRepository,
  signal: AbortSignal,
): Promise<FrameworkId | null | undefined> {
  const query = new URLSearchParams({
    owner: repository.owner.login,
    repo: repository.name,
    ref: repository.default_branch,
  });
  const response = await fetch(`/api/github/detect?${query.toString()}`, {
    signal,
  });
  // Failures stay unknown (language icon) and are retried next visit.
  if (!response.ok) return undefined;
  return frameworkDetectionSchema.parse(await response.json()).framework;
}

/**
 * Detects each repository's framework in the background, a few at a time, so
 * the list can show framework logos. Unknown entries render with the language
 * icon until their detection lands.
 */
export function useRepositoryFrameworks(repositories: GitHubRepository[]) {
  const [frameworks, setFrameworks] = useState<Frameworks>({});
  useEffect(() => {
    const controller = new AbortController();
    const cached: Frameworks = {};
    const queue: GitHubRepository[] = [];
    for (const repository of repositories) {
      const stored = readStored(repository);
      if (stored === undefined) queue.push(repository);
      else cached[repository.full_name] = stored;
    }
    setFrameworks(cached);
    async function worker() {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const repository = next;
        try {
          const framework = await detect(repository, controller.signal);
          if (framework === undefined) continue;
          store(repository, framework);
          setFrameworks((current) => ({
            ...current,
            [repository.full_name]: framework,
          }));
        } catch {
          if (controller.signal.aborted) return;
        }
      }
    }
    for (let index = 0; index < CONCURRENCY; index += 1) void worker();
    return () => controller.abort();
  }, [repositories]);
  return frameworks;
}
