"use client";

import { DASH_MENU, DASH_MENU_ITEM } from "@/components/dashboard/menu";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import {
  LiveLayoutGrid,
  LiveList,
  LiveListFilter,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { cn } from "@/lib/utils";

export type ProjectLayout = "grid" | "list";
export type ProjectFilter = "all" | "building" | "error" | "ready";
export type ProjectSort = "activity" | "name";
export type ProjectView = "projects" | "usage";

interface ProjectsToolbarProps {
  layout: ProjectLayout;
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
  onLayoutChange: (layout: ProjectLayout) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: ProjectSort) => void;
  query: string;
  sort: ProjectSort;
}

/** Search, status filter, sort and layout for the project list. */
export function ProjectsToolbar(props: ProjectsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DashboardSearchInput
        containerClassName="min-w-56 flex-1"
        onValueChange={props.onQueryChange}
        placeholder="Search projects, domains and repositories"
        value={props.query}
      />
      <SegmentedControl
        aria-label="Filter by status"
        className="hidden md:inline-flex"
        onChange={props.onFilterChange}
        options={[
          { value: "all", label: "All" },
          { value: "ready", label: "Ready" },
          { value: "building", label: "Building" },
          { value: "error", label: "Failed" },
        ]}
        value={props.filter}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Sort and filter projects"
            className="size-9"
            data-icon-trigger
            size="icon-lg"
            variant="raised"
          >
            <LiveListFilter className="size-4" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(DASH_MENU, "w-56")}>
          <div className="md:hidden">
            <DropdownMenuLabel className="px-2.5 text-[11px] text-muted-foreground">
              Status
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                props.onFilterChange(toProjectFilter(value))
              }
              value={props.filter}
            >
              {(["all", "ready", "building", "error"] as const).map((value) => (
                <DropdownMenuRadioItem
                  className={DASH_MENU_ITEM}
                  key={value}
                  value={value}
                >
                  {value === "all"
                    ? "All projects"
                    : value === "error"
                      ? "Failed"
                      : value[0]?.toUpperCase() + value.slice(1)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </div>
          <DropdownMenuLabel className="px-2.5 text-[11px] text-muted-foreground">
            Sort by
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={(value) => props.onSortChange(toProjectSort(value))}
            value={props.sort}
          >
            <DropdownMenuRadioItem className={DASH_MENU_ITEM} value="activity">
              Recent activity
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className={DASH_MENU_ITEM} value="name">
              Name
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SegmentedControl
        aria-label="Layout"
        onChange={props.onLayoutChange}
        options={[
          {
            value: "grid",
            label: "Grid",
            icon: LiveLayoutGrid,
            iconOnly: true,
          },
          { value: "list", label: "List", icon: LiveList, iconOnly: true },
        ]}
        value={props.layout}
      />
    </div>
  );
}

function toProjectFilter(value: string): ProjectFilter {
  return value === "ready" || value === "building" || value === "error"
    ? value
    : "all";
}

function toProjectSort(value: string): ProjectSort {
  return value === "name" ? "name" : "activity";
}
