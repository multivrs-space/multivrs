"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DeployStepsCard } from "@/features/dashboard/components/DeployStepsCard";
import { ImportFromUrlCard } from "@/features/dashboard/components/ImportFromUrlCard";
import { RepositoryPicker } from "@/features/dashboard/components/RepositoryPicker";
import { githubImportHref } from "@/features/dashboard/lib/github-import";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

export function NewProjectFlow({ username }: { username: string }) {
  const router = useRouter();
  const [importingId, setImportingId] = useState<number | null>(null);

  function openRepository(repository: GitHubRepository) {
    setImportingId(repository.id);
    router.push(githubImportHref(repository, username));
  }

  return (
    <div className="w-full space-y-6 px-5 py-6 lg:px-8">
      <Link
        href={`/${username}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All projects
      </Link>
      <DashboardPageHeader
        title="New Project"
        description="Choose a repository to deploy. Multivrs detects how to build it."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RepositoryPicker
          callbackURL={`/${username}/new`}
          importingId={importingId}
          onImport={openRepository}
        />
        <aside className="space-y-4 lg:sticky lg:top-20">
          <ImportFromUrlCard onImport={openRepository} />
          <DeployStepsCard />
        </aside>
      </div>
    </div>
  );
}
