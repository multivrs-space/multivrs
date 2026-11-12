"use client";

import { type FormEvent, useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { Spinner } from "@/components/dashboard/Spinner";
import { LiveChevronRight, LiveLink } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import {
  type GitHubRepository,
  githubRepositoryUrlSchema,
} from "@/lib/schemas/github.schemas";

/** Turns a pasted public GitHub URL into the same shape the repository list uses. */
function repositoryFromUrl(raw: string): GitHubRepository | string {
  const parsed = githubRepositoryUrlSchema.safeParse(
    /^https?:\/\//.test(raw) ? raw : `https://${raw}`,
  );
  if (!parsed.success)
    return parsed.error.issues[0]?.message ?? "Enter a GitHub repository URL";
  const [owner, rawName] = new URL(parsed.data).pathname
    .split("/")
    .filter(Boolean);
  const name = rawName?.replace(/\.git$/, "");
  if (!owner || !name) return "Include both the owner and the repository";
  return {
    default_branch: "",
    description: null,
    forks_count: 0,
    full_name: `${owner}/${name}`,
    html_url: `https://github.com/${owner}/${name}`,
    id: -1,
    language: null,
    name,
    owner: { avatar_url: `https://github.com/${owner}.png`, login: owner },
    private: false,
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  };
}

export function ImportFromUrlCard({
  busy,
  onImport,
}: {
  busy: boolean;
  onImport: (repository: GitHubRepository) => void;
}) {
  const [url, setUrl] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = repositoryFromUrl(url.trim());
    if (typeof result === "string") setProblem(result);
    else onImport(result);
  }

  return (
    <DashCard aria-label="Import by URL">
      <DashCardHeader
        description="Any public GitHub repository"
        icon={LiveLink}
        title="Import by URL"
      />
      <form className="space-y-2.5 p-5 pt-4" noValidate onSubmit={submit}>
        <label className="surface-inset flex h-10 items-center gap-2 rounded-control px-3 focus-within:ring-2 focus-within:ring-ring/60">
          <span className="sr-only">Repository URL</span>
          <GitHubMark className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            aria-describedby={problem ? "import-url-problem" : undefined}
            aria-invalid={problem ? true : undefined}
            className="min-w-0 flex-1 bg-transparent font-geist-mono text-[12.5px] text-foreground caret-primary outline-hidden placeholder:font-sans placeholder:text-muted-foreground"
            inputMode="url"
            onChange={(event) => {
              setUrl(event.target.value);
              setProblem(null);
            }}
            placeholder="github.com/owner/repository"
            value={url}
          />
        </label>
        {problem ? (
          <p
            className="text-xs text-rose-700 dark:text-rose-300"
            id="import-url-problem"
          >
            {problem}
          </p>
        ) : null}
        <Button
          className="w-full"
          data-icon-trigger
          disabled={busy || !url.trim()}
          size="sm"
          type="submit"
          variant="raised"
        >
          {busy ? <Spinner className="size-3" /> : null}
          Continue
          {busy ? null : (
            <LiveChevronRight className="size-3.5" strokeWidth={2} />
          )}
        </Button>
      </form>
    </DashCard>
  );
}
