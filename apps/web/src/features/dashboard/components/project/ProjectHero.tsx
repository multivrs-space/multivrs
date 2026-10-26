import { FRAMEWORK_IDS } from "@multivrs/config";
import { ArrowUpRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { buttonVariants } from "@/components/ui/button-variants";
import { RepositoryIcon } from "@/features/dashboard/components/RepositoryIcon";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

function knownFramework(value: string | null) {
  return FRAMEWORK_IDS.find((id) => id === value) ?? null;
}

/** Identity, live state and the project's address, front and centre. */
export function ProjectHero({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const latest = data.recentDeployments[0];
  const live = data.production
    ? deploymentStatus("ready")
    : deploymentStatus(latest?.status);
  const framework = knownFramework(data.framework);
  const address = data.address?.replace(/^https?:\/\//, "") ?? null;
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="scale-125">
          <RepositoryIcon
            framework={framework}
            language={null}
            name={data.name}
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {data.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-(--hairline) px-2 py-0.5 text-[11px] font-medium",
                live.text,
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full ring-4",
                  live.dot,
                  live.ring,
                )}
              />
              {data.production ? "Live" : live.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {framework ? FRAMEWORK_LABELS[framework] : "Framework not set"} ·
            Created{" "}
            {new Date(data.createdAt).toLocaleDateString("en-US", {
              dateStyle: "medium",
              timeZone: "UTC",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {address ? (
          <div className="flex h-9 items-center gap-1 rounded-md border border-(--hairline) bg-(--ink-raised) pl-3 pr-1 font-mono text-xs">
            <span className="text-muted-foreground">https://</span>
            <span className="max-w-64 truncate text-foreground">{address}</span>
            <CopyButton text={`https://${address}`} className="size-7" />
          </div>
        ) : null}
        <Link
          href={`${base}/settings`}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "border-(--hairline) bg-transparent",
          )}
        >
          <Settings2 className="size-4" /> Settings
        </Link>
        {data.production && data.address ? (
          <a
            href={data.address}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            Visit <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </header>
  );
}
