"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveArrowLeft } from "@/components/icons/animated";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import { RailNavLink } from "@/features/dashboard/components/shell/RailNavGroups";
import { PROJECT_NAV_GROUPS } from "@/features/dashboard/constants/project-navigation";
import { useProjectSummary } from "@/features/dashboard/hooks/useProjectSummary";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

const STATUS = {
  ready: { tone: "ready", label: "Live" },
  building: { tone: "building", label: "Building" },
  error: { tone: "error", label: "Failed" },
  idle: { tone: "idle", label: "Not deployed" },
} as const;

/**
 * The rail inside a project: a way back to the workspace, the project's own
 * identity and state, then only its sections, with what each one holds.
 */
export function ProjectRailNav({
  narrow,
  onNavigate,
}: {
  narrow: boolean;
  onNavigate?: (slug: string, event: MouseEvent<HTMLElement>) => void;
}) {
  const { username, scope } = useDashboardScope();
  const summary = useProjectSummary(username, scope);
  const state = STATUS[summary?.status ?? "idle"];
  return (
    <>
      <div
        className={cn("mt-1 space-y-2", narrow && "flex flex-col items-center")}
      >
        <Link
          aria-label={narrow ? "All projects" : undefined}
          className="flex h-7 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground"
          data-icon-trigger
          href={`/${username}/~/projects`}
        >
          <LiveArrowLeft className="size-3.5" strokeWidth={2} />
          {narrow ? null : "All projects"}
        </Link>
        <Link
          aria-label={narrow ? (summary?.name ?? scope) : undefined}
          className={cn(
            "surface-inset flex items-center gap-2.5 rounded-tile transition-colors hover:bg-foreground/[0.03]",
            narrow ? "size-10 justify-center p-0" : "p-2.5",
          )}
          href={`/${username}/${scope}`}
          onClick={(event) => onNavigate?.("", event)}
        >
          <ProjectFavicon
            className={narrow ? "size-6" : "size-8"}
            name={summary?.name ?? scope}
            url={summary?.faviconUrl ?? null}
          />
          {narrow ? null : (
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                  {summary?.name ?? scope}
                </span>
                <StatusOrb label={state.label} tone={state.tone} />
              </span>
              <span className="block truncate font-geist-mono text-[10.5px] text-muted-foreground">
                {summary ? (summary.siteLabel ?? state.label) : " "}
              </span>
            </span>
          )}
        </Link>
      </div>
      {PROJECT_NAV_GROUPS.map((group) => (
        <section className="mt-3" key={group.id}>
          {!group.label ? null : narrow ? (
            <div className="mx-auto mb-2 h-px w-5 bg-hairline-strong" />
          ) : (
            <p className="mb-1 px-2.5 font-geist-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/55">
              {group.label}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.slug}>
                <RailNavLink
                  count={summary?.counts[item.slug]}
                  item={item}
                  narrow={narrow}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
