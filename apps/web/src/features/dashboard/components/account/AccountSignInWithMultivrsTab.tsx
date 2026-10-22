"use client";

import { ChevronDown, ExternalLink, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ConnectedApp {
  id: string;
  name: string;
  owner: string;
  verified: boolean;
  connectedDate: string;
}

export function AccountSignInWithMultivrsTab({
  apps = [],
}: {
  apps?: ConnectedApp[];
}) {
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>(apps);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredApps = connectedApps.filter((app) => {
    const matchesQuery = app.name.toLowerCase().includes(filter.toLowerCase());
    if (selectedFilter === "Owned by Multivrs") {
      return matchesQuery && app.owner.toLowerCase() === "multivrs";
    }
    if (selectedFilter === "Third-party") {
      return matchesQuery && app.owner.toLowerCase() !== "multivrs";
    }
    return matchesQuery;
  });

  const handleDisconnect = (id: string, name: string) => {
    setConnectedApps((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Disconnected from ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Sign in with Multivrs
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Use your Multivrs account to log in to third-party applications.{" "}
          <span className="text-foreground underline underline-offset-4 cursor-pointer inline-flex items-center gap-0.5">
            Learn More <ExternalLink className="size-3" />
          </span>
        </p>
      </div>

      {/* Filter and Search Bar (Always visible) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-border bg-background text-xs text-foreground hover:bg-muted"
            >
              <span>{selectedFilter}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-popover border-border text-popover-foreground p-1">
            {["All", "Owned by Multivrs", "Third-party"].map((option) => (
              <DropdownMenuItem
                key={option}
                className="text-xs cursor-pointer"
                onClick={() => setSelectedFilter(option)}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Applications List Container */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{app.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>Owned by {app.owner}</span>
                    {app.verified && (
                      <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-muted text-[9px] text-muted-foreground">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">
                  Connected {app.connectedDate}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="size-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-popover border-border text-popover-foreground p-1">
                    <DropdownMenuItem
                      className="text-xs cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => handleDisconnect(app.id, app.name)}
                    >
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No applications found
          </div>
        )}
      </div>
    </div>
  );
}
