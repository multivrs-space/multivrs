"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import {
  type AnimatedIcon,
  LiveActivity,
  LiveArrowUpRight,
  LiveCopy,
  LiveEllipsis,
  LiveGitBranch,
  LiveGlobe,
  LiveRocket,
  LiveScrollText,
  LiveSettings,
  LiveTrash,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectDialog } from "@/features/dashboard/components/DeleteProjectDialog";
import { cn } from "@/lib/utils";

interface ProjectCardActionsProps {
  href: string;
  projectId: string;
  projectName: string;
  siteUrl: string | null;
  repositoryUrl: string | null;
}

const PAGES: [label: string, slug: string, icon: AnimatedIcon][] = [
  ["Deployments", "deployments", LiveRocket],
  ["Logs", "logs", LiveScrollText],
  ["Analytics", "analytics", LiveActivity],
  ["Domains", "domains", LiveGlobe],
  ["Settings", "settings", LiveSettings],
];

const GROUP =
  "px-2.5 pb-1 pt-2 font-geist-mono text-[9.5px] font-normal uppercase tracking-[0.16em] text-muted-foreground/60";

/** The live site, its code, the project's pages, then delete. Items show only when they'd work. */
export function ProjectCardActions({
  href,
  projectId,
  projectName,
  siteUrl,
  repositoryUrl,
}: ProjectCardActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const external = siteUrl || repositoryUrl;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`${projectName} actions`}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            data-icon-trigger
            size="icon-sm"
            variant="quiet"
          >
            <LiveEllipsis className="size-4" strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-52")}>
          {siteUrl ? (
            <>
              <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
                <a
                  data-icon-trigger
                  href={siteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <LiveArrowUpRight strokeWidth={1.75} />
                  Visit site
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={DASH_MENU_ITEM}
                data-icon-trigger
                onSelect={() =>
                  void navigator.clipboard
                    .writeText(siteUrl)
                    .then(() => toast.success("Address copied"))
                }
              >
                <LiveCopy strokeWidth={1.75} />
                Copy address
              </DropdownMenuItem>
            </>
          ) : null}
          {repositoryUrl ? (
            <DropdownMenuItem asChild className={DASH_MENU_ITEM}>
              <a
                data-icon-trigger
                href={repositoryUrl}
                rel="noreferrer"
                target="_blank"
              >
                <LiveGitBranch strokeWidth={1.75} />
                Open repository
              </a>
            </DropdownMenuItem>
          ) : null}
          {external ? (
            <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
          ) : null}
          <DropdownMenuLabel className={GROUP}>Go to</DropdownMenuLabel>
          {PAGES.map(([label, slug, Icon]) => (
            <DropdownMenuItem asChild className={DASH_MENU_ITEM} key={slug}>
              <Link data-icon-trigger href={`${href}/${slug}`}>
                <Icon strokeWidth={1.75} />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
          <DropdownMenuItem
            className={cn(
              DASH_MENU_ITEM,
              "text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400",
            )}
            data-icon-trigger
            onSelect={() => setConfirming(true)}
          >
            <LiveTrash strokeWidth={1.75} />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteProjectDialog
        onOpenChange={setConfirming}
        open={confirming}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
}
