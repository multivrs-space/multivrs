"use client";

import { ArrowRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import {
  type GitHubRepository,
  githubRepositoryUrlSchema,
} from "@/lib/schemas/github.schemas";

/** Turns a pasted public GitHub URL into the same shape the repository list uses. */
export function ImportFromUrlCard({
  onImport,
}: {
  onImport: (repository: GitHubRepository) => void;
}) {
  const [url, setUrl] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = url.trim();
    const parsed = githubRepositoryUrlSchema.safeParse(
      /^https?:\/\//.test(raw) ? raw : `https://${raw}`,
    );
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid GitHub URL");
      return;
    }
    const [owner, rawName] = new URL(parsed.data).pathname
      .split("/")
      .filter(Boolean);
    const name = rawName?.replace(/\.git$/, "");
    if (!owner || !name) {
      toast.error("Repository owner and name are required");
      return;
    }
    onImport({
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
    });
  }

  return (
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised) p-4">
      <h2 className="text-sm font-semibold">Import by URL</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Any public GitHub repository.
      </p>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <label className="flex h-9 items-center gap-2 rounded-md border border-(--hairline) bg-foreground/[0.03] px-3 focus-within:border-ring">
          <span className="sr-only">Repository URL</span>
          <GitHubMark className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="github.com/owner/repo"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-hidden placeholder:text-muted-foreground"
          />
        </label>
        <Button type="submit" size="sm" variant="secondary" className="w-full">
          Continue <ArrowRight className="size-3.5" />
        </Button>
      </form>
    </section>
  );
}
