"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import {
  LiveArrowUpRight,
  LiveCopy,
  LiveEllipsis,
  LiveGitBranch,
  LiveLayoutGrid,
  LiveRefresh,
  LiveScrollText,
  LiveX,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import { RedeployDialog } from "@/features/dashboard/components/deployments/RedeployDialog";
import { useCancelDeployment } from "@/features/dashboard/hooks/useCancelDeployment";
import { redeploySource } from "@/features/dashboard/lib/redeploy-source";
import { cn } from "@/lib/utils";

/** What you can do with one deployment; items show only when they'd work. */
export function DeploymentActions({
  deployment: d,
}: {
  deployment: DashboardDeployment;
}) {
  const { cancel, canceling } = useCancelDeployment(d.projectId, d.id);
  const [redeploying, setRedeploying] = useState(false);
  const running = d.status === "Building" || d.status === "Queued";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Actions for deployment ${d.id.slice(0, 8)}`}
            className="relative z-10 size-8 rounded-full text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            data-icon-trigger
            size="icon-sm"
            variant="quiet"
          >
            <LiveEllipsis className="size-4" strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-52")}>
          <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
            <Link data-icon-trigger href={d.detailsUrl}>
              <LiveScrollText strokeWidth={1.75} />
              Build log and details
            </Link>
          </DropdownMenuItem>
          {d.url ? (
            <>
              <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
                <a
                  data-icon-trigger
                  href={d.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <LiveArrowUpRight strokeWidth={1.75} />
                  Visit
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={DASH_MENU_ITEM}
                data-icon-trigger
                onSelect={() =>
                  void navigator.clipboard
                    .writeText(d.url)
                    .then(() => toast.success("Deployment URL copied"))
                }
              >
                <LiveCopy strokeWidth={1.75} />
                Copy URL
              </DropdownMenuItem>
            </>
          ) : null}
          {d.commitUrl ? (
            <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
              <a
                data-icon-trigger
                href={d.commitUrl}
                rel="noreferrer"
                target="_blank"
              >
                <LiveGitBranch strokeWidth={1.75} />
                View commit
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
            <Link
              data-icon-trigger
              href={`/${d.detailsUrl.split("/")[1]}/${d.projectSlug}`}
            >
              <LiveLayoutGrid strokeWidth={1.75} />
              Open {d.project}
            </Link>
          </DropdownMenuItem>
          {running || !d.canRedeploy ? null : (
            <DropdownMenuItem
              className={DASH_MENU_ITEM}
              data-icon-trigger
              onSelect={() => setRedeploying(true)}
            >
              <LiveRefresh strokeWidth={1.75} />
              Redeploy
            </DropdownMenuItem>
          )}
          {running ? (
            <>
              <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
              <DropdownMenuItem
                className={cn(
                  DASH_MENU_ITEM,
                  "text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400",
                )}
                data-icon-trigger
                disabled={canceling}
                onSelect={cancel}
              >
                <LiveX strokeWidth={1.75} />
                {canceling ? "Canceling…" : "Cancel build"}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {d.canRedeploy ? (
        <RedeployDialog
          onOpenChange={setRedeploying}
          open={redeploying}
          source={redeploySource(d)}
        />
      ) : null}
    </>
  );
}
