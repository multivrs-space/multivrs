import { FRAMEWORK_IDS } from "@multivrs/config";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveSettings } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import { deploymentStatus } from "@/features/dashboard/lib/deployment-status";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

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
  const created = new Date(data.createdAt).toLocaleDateString("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="surface-raised grid size-12 shrink-0 place-items-center rounded-tile">
          <ProjectFavicon
            className="size-7"
            name={data.name}
            url={data.faviconUrl}
          />
        </span>
        <div className="min-w-0">
          <p className="mb-1.5 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {framework ? FRAMEWORK_LABELS[framework] : "Framework not set"} ·
            Created {created}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[32px]">
              {data.name}
            </h1>
            <StatusOrb
              label={data.production ? "Live" : live.label}
              pill
              tone={live.tone}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {address ? (
          <div className="surface-inset flex h-9 items-center gap-1 rounded-full pl-3.5 pr-1 font-geist-mono text-xs">
            <span className="text-muted-foreground">https://</span>
            <span className="max-w-64 truncate text-foreground">{address}</span>
            <CopyButton className="size-7" text={`https://${address}`} />
          </div>
        ) : null}
        <Link
          className={buttonVariants({ size: "sm", variant: "raised" })}
          data-icon-trigger
          href={`${base}/settings`}
        >
          <LiveSettings strokeWidth={1.75} />
          Settings
        </Link>
      </div>
    </header>
  );
}
