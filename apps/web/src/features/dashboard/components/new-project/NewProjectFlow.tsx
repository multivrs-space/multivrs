"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DeployStepsCard } from "@/features/dashboard/components/new-project/DeployStepsCard";
import { ImportFromUrlCard } from "@/features/dashboard/components/new-project/ImportFromUrlCard";
import { RepositoryPicker } from "@/features/dashboard/components/new-project/RepositoryPicker";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { githubImportHref } from "@/features/dashboard/lib/github-import";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

/** Step one of a new project: choose what to deploy. */
export function NewProjectFlow({ username }: { username: string }) {
  const router = useRouter();
  const [importingId, setImportingId] = useState<number | null>(null);

  function openRepository(repository: GitHubRepository) {
    setImportingId(repository.id);
    router.push(githubImportHref(repository, username));
  }

  return (
    <PageBody>
      <BackLink href={`/${username}/~/projects`} label="Projects" />
      <DashboardPageHeader
        description="Pick a repository. Multivrs reads it, works out how to build it, and puts it live on its own address."
        eyebrow={`${username} · New project`}
        title="What are you shipping?"
      />
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <RepositoryPicker
          callbackURL={`/${username}/new`}
          className="lg:col-span-8"
          importingId={importingId}
          onImport={openRepository}
        />
        <aside className="grid gap-3 lg:sticky lg:top-[calc(var(--topbar-h)+1.25rem)] lg:col-span-4">
          <ImportFromUrlCard
            busy={importingId === -1}
            onImport={openRepository}
          />
          <DeployStepsCard />
        </aside>
      </div>
    </PageBody>
  );
}
