import { Check } from "lucide-react";
import type { RefObject } from "react";
import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import { LiveLayoutGrid, LivePlus } from "@/components/icons/animated";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import type { ProjectOption } from "@/features/dashboard/components/ProjectScopeSwitcher";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";

interface ProjectScopeMenuProps {
  currentScope: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isAllProjects: boolean;
  projects: ProjectOption[];
  query: string;
  onCreate(): void;
  onQueryChange(value: string): void;
  onSelect(scope: string): void;
}

export function ProjectScopeMenu({
  currentScope,
  inputRef,
  isAllProjects,
  projects,
  query,
  onCreate,
  onQueryChange,
  onSelect,
}: ProjectScopeMenuProps) {
  return (
    <DropdownMenuContent align="start" className={cn(DASH_MENU, "w-[300px]")}>
      <DashboardSearchInput
        onKeyDown={(event) => event.stopPropagation()}
        onValueChange={onQueryChange}
        placeholder="Find project…"
        ref={inputRef}
        size="sm"
        value={query}
      />
      <div className="mt-1.5 max-h-[280px] space-y-0.5 overflow-y-auto">
        <ScopeRow
          all
          label="All projects"
          onSelect={() => onSelect(ALL_PROJECTS_SCOPE)}
          selected={isAllProjects}
        />
        {projects.map((project) => (
          <ScopeRow
            faviconUrl={project.faviconUrl ?? null}
            key={project.slug}
            label={project.name}
            onSelect={() => onSelect(project.slug)}
            selected={currentScope === project.slug}
          />
        ))}
        {projects.length === 0 ? (
          <p className="px-3 py-2 text-[12px] text-muted-foreground/70">
            No projects match “{query}”.
          </p>
        ) : null}
      </div>
      <DropdownMenuSeparator className="mx-0 my-1.5 bg-hairline" />
      <DropdownMenuItem
        className={DASH_MENU_ITEM}
        data-icon-trigger
        onSelect={onCreate}
      >
        <LivePlus className="size-4" strokeWidth={1.75} />
        New project
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function ScopeRow({
  label,
  all = false,
  faviconUrl = null,
  selected,
  onSelect,
}: {
  label: string;
  all?: boolean;
  faviconUrl?: string | null;
  selected: boolean;
  onSelect(): void;
}) {
  return (
    <DropdownMenuItem
      className={cn(DASH_MENU_ITEM, selected && "text-foreground")}
      data-icon-trigger
      onSelect={onSelect}
    >
      <span className="surface-inset grid size-6 shrink-0 place-items-center overflow-hidden rounded-[7px]">
        {all ? (
          <LiveLayoutGrid className="size-3.5" strokeWidth={1.75} />
        ) : (
          <ProjectFavicon
            className="size-4 rounded-[4px]"
            name={label}
            url={faviconUrl}
          />
        )}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {selected ? <Check className="size-4 text-primary" /> : null}
    </DropdownMenuItem>
  );
}
