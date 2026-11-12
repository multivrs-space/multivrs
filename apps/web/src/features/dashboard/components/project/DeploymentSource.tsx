import { Suspense } from "react";
import { LiveGitBranch } from "@/components/icons/animated";
import {
  CommitSha,
  CommitSource,
} from "@/features/dashboard/components/project/CommitSource";

/** Branch, then the commit: its title and author when GitHub can tell us. */
export function DeploymentSource({
  branch,
  commitSha,
  repositoryUrl,
}: {
  branch: string;
  commitSha: string | null;
  repositoryUrl: string | null;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-1.5 font-geist-mono text-[12.5px]">
        <LiveGitBranch className="size-3.5 shrink-0" strokeWidth={1.75} />
        {branch}
      </span>
      {!commitSha ? (
        <span className="text-xs text-muted-foreground">
          Commit not recorded for this build
        </span>
      ) : repositoryUrl ? (
        <Suspense
          fallback={<CommitSha repositoryUrl={repositoryUrl} sha={commitSha} />}
        >
          <CommitSource repositoryUrl={repositoryUrl} sha={commitSha} />
        </Suspense>
      ) : (
        <CommitSha repositoryUrl={null} sha={commitSha} />
      )}
    </span>
  );
}
