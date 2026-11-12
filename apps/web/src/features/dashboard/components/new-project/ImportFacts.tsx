import type { FrameworkId } from "@multivrs/config";
import type { ReactNode } from "react";
import { LiveGitBranch, LiveGlobe } from "@/components/icons/animated";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { FrameworkLogo } from "@/features/dashboard/components/new-project/FrameworkLogo";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import type { RepositorySource } from "@/features/dashboard/types/deployment-import.types";

/** Where the code comes from and where it will live, as label/value rows. */
export function ImportFacts({
  address,
  framework,
  rootDirectory,
  source,
}: {
  address: string;
  framework: FrameworkId;
  rootDirectory: string;
  source: RepositorySource;
}) {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Repository",
      value: (
        <a
          className="flex min-w-0 items-center gap-1.5 hover:underline"
          href={source.url}
          rel="noreferrer"
          target="_blank"
        >
          <GitHubMark className="size-3.5 shrink-0" />
          <span className="truncate">
            {source.owner}/{source.name}
          </span>
        </a>
      ),
    },
    {
      label: "Branch",
      value: (
        <span className="flex items-center gap-1.5 font-geist-mono text-[12px]">
          <LiveGitBranch className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{source.branch}</span>
        </span>
      ),
    },
    {
      label: "Framework",
      value: (
        <span className="flex items-center gap-1.5">
          <FrameworkLogo className="size-3.5" framework={framework} />
          {FRAMEWORK_LABELS[framework]}
        </span>
      ),
    },
    {
      label: "Folder",
      value: (
        <span className="font-geist-mono text-[12px]">{rootDirectory}</span>
      ),
    },
    {
      label: "Address",
      value: (
        <span className="flex min-w-0 items-center gap-1.5 font-geist-mono text-[12px]">
          <LiveGlobe className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {address.replace(/^https?:\/\//, "")}
          </span>
        </span>
      ),
    },
  ];
  return (
    <dl className="surface-inset divide-y divide-hairline rounded-tile px-3.5 text-[13px]">
      {rows.map((row) => (
        <div
          className="flex items-center justify-between gap-4 py-2.5"
          data-icon-trigger
          key={row.label}
        >
          <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
          <dd className="flex min-w-0 justify-end text-right text-foreground">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
