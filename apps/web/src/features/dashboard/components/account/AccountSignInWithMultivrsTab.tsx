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
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Sign in with Multivrs
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Use your Multivrs account to log in to third-party applications.{" "}
          <span className="text-zinc-300 underline underline-offset-4 cursor-pointer hover:text-white inline-flex items-center gap-0.5">
            Learn More <ExternalLink className="size-3" />
          </span>
        </p>
      </div>

      {/* Filter and Search Bar (Always visible) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-zinc-800 bg-black/60 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-zinc-800 bg-black/60 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              <span>{selectedFilter}</span>
              <ChevronDown className="size-3 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-zinc-950 border-zinc-800 p-1">
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
      <div className="rounded-lg border border-zinc-800 bg-black/60 divide-y divide-zinc-800 overflow-hidden">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{app.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <span>Owned by {app.owner}</span>
                    {app.verified && (
                      <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-zinc-800 text-[9px] text-zinc-300">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">
                  Connected {app.connectedDate}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="size-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border-zinc-800 p-1">
                    <DropdownMenuItem
                      className="text-xs cursor-pointer text-red-400 hover:text-red-300"
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
          <div className="py-12 text-center text-xs text-zinc-500">
            No applications found
          </div>
        )}
      </div>
    </div>
  );
}
