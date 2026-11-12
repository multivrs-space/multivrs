import { Check, ChevronsUpDown } from "lucide-react";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import {
  DASH_FIELD,
  DASH_MENU,
  DASH_MENU_ITEM,
} from "@/components/dashboard/menu";
import { LiveLayoutGrid } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import type { DomainProjectOption } from "@/lib/services/domain.service";
import { cn } from "@/lib/utils";

interface AssignDomainTargetStepProps {
  fullDomain: string;
  pending: boolean;
  projectId: string;
  projectSearch: string;
  projects: DomainProjectOption[];
  selectedProject?: DomainProjectOption;
  dropdownOpen: boolean;
  onBack(): void;
  onDropdownChange(open: boolean): void;
  onProjectChange(projectId: string): void;
  onSearchChange(value: string): void;
  onSubmit(): void;
}

/** Step 2 of 2: pick the project the domain should serve. */
export function AssignDomainTargetStep(props: AssignDomainTargetStepProps) {
  const filtered = props.projects.filter((project) =>
    project.name.toLowerCase().includes(props.projectSearch.toLowerCase()),
  );
  return (
    <>
      <DashDialogHeader
        description={
          <>
            Choose which project{" "}
            <span className="font-geist-mono text-foreground">
              {props.fullDomain}
            </span>{" "}
            serves.
          </>
        }
        icon={LiveLayoutGrid}
        title="Connect domain · 2 of 2"
      />
      <div className="space-y-1.5">
        <span className="block text-xs font-medium">Project</span>
        <DropdownMenu
          onOpenChange={props.onDropdownChange}
          open={props.dropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                DASH_FIELD,
                "flex w-full items-center justify-between px-3",
              )}
              type="button"
            >
              <span>{props.selectedProject?.name ?? "Select a project"}</span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn(DASH_MENU, "w-(--radix-dropdown-menu-trigger-width)")}
          >
            <DashboardSearchInput
              onKeyDown={(event) => event.stopPropagation()}
              onValueChange={props.onSearchChange}
              placeholder="Find project…"
              size="sm"
              value={props.projectSearch}
            />
            <div className="mt-1.5 max-h-48 space-y-0.5 overflow-y-auto">
              {filtered.map((project) => (
                <DropdownMenuItem
                  className={cn(
                    DASH_MENU_ITEM,
                    project.id === props.projectId && "text-foreground",
                  )}
                  key={project.id}
                  onSelect={() => props.onProjectChange(project.id)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {project.name}
                  </span>
                  {project.id === props.projectId ? (
                    <Check className="size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DialogFooter className="gap-2">
        <Button onClick={props.onBack} size="sm" type="button" variant="quiet">
          Back
        </Button>
        <Button
          disabled={!props.projectId || props.pending}
          onClick={props.onSubmit}
          size="sm"
          type="button"
          variant="hero"
        >
          {props.pending ? "Connecting…" : "Connect"}
        </Button>
      </DialogFooter>
    </>
  );
}
