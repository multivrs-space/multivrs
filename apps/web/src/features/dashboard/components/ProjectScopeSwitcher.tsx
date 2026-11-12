"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LiveLayoutGrid } from "@/components/icons/animated";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import { ProjectScopeMenu } from "@/features/dashboard/components/ProjectScopeMenu";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

export interface ProjectOption {
  slug: string;
  name: string;
  /** The live site's logo; absent until production is serving. */
  faviconUrl?: string | null;
}

export function ProjectScopeSwitcher({
  projects = [],
}: {
  projects?: ProjectOption[];
}) {
  const router = useRouter();
  const { username, scope, activeSlug, isAllProjects } = useDashboardScope();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Show the project's name rather than its URL slug when we know it.
  const currentProject = projects.find((project) => project.slug === scope);
  const current = currentProject?.name ?? scope;
  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const select = (nextScope: string) => {
    close();
    // From the workspace project list, picking a project opens that project.
    const slug = activeSlug === "projects" ? "" : activeSlug;
    router.push(buildNavHref(username, nextScope, slug));
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className="surface-raised surface-press flex h-8 items-center gap-2 rounded-full pl-1 pr-2.5 text-[13px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <span className="surface-inset grid size-6 place-items-center overflow-hidden rounded-full text-muted-foreground">
            {isAllProjects ? (
              <LiveLayoutGrid className="size-3.5" strokeWidth={1.75} />
            ) : (
              <ProjectFavicon
                className="size-4 rounded-[4px]"
                name={current}
                url={currentProject?.faviconUrl ?? null}
              />
            )}
          </span>
          <span className="max-w-[110px] truncate sm:max-w-[180px]">
            {isAllProjects ? "All projects" : current}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/70" />
        </button>
      </DropdownMenuTrigger>
      <ProjectScopeMenu
        currentScope={scope}
        inputRef={inputRef}
        isAllProjects={isAllProjects}
        projects={filtered}
        query={query}
        onCreate={() => {
          close();
          router.push(`/${username}/new`);
        }}
        onQueryChange={setQuery}
        onSelect={select}
      />
    </DropdownMenu>
  );
}
