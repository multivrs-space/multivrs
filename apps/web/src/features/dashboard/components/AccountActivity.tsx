"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, Filter, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

interface AccountActivityProps {
  events: DashboardAuditEvent[];
  userImage?: string | null;
  userName?: string | null;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffHours = Math.floor(diffSec / 3600);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMins = Math.floor(diffSec / 60);
      return diffMins <= 1 ? "just now" : `${diffMins}m`;
    }
    return `${diffHours}h`;
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(isSameYear ? {} : { year: "numeric" }),
  });
}

function getMonthKey(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function renderEventSentence(event: DashboardAuditEvent): React.ReactNode {
  const metadata = (event.metadata as Record<string, unknown>) || {};
  const action = event.action;

  switch (action) {
    case "auth.login":
      return <>You logged in to Multivrs.</>;
    case "auth.logout":
      return <>You logged out of Multivrs.</>;
    case "oauth.connected": {
      const provider = String(metadata.providerId || "GitHub");
      const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
      return (
        <>
          You connected the{" "}
          <span className="font-medium text-white">{capitalized}</span> account.
        </>
      );
    }
    case "oauth.unlinked": {
      const provider = String(metadata.providerId || "GitHub");
      const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
      return (
        <>
          Your{" "}
          <span className="font-medium text-white">{capitalized}</span> account was unlinked.
        </>
      );
    }
    case "email.verified":
      return (
        <>
          You verified email{" "}
          <span className="font-medium text-white">
            {String(metadata.email || "")}
          </span>
          .
        </>
      );
    case "user.created":
      return <>You created your Multivrs account.</>;
    case "user.2fa_enabled":
      return <>You enabled two-factor authentication in your account.</>;
    case "user.2fa_disabled":
      return <>Two-factor authentication was disabled for you.</>;
    case "api_token.create":
      return (
        <>
          You created a Personal Access Token{" "}
          <span className="font-medium text-white">
            &ldquo;{String(metadata.name || "Token")}&rdquo;
          </span>
          .
        </>
      );
    case "api_token.revoke":
      return <>You revoked a Personal Access Token.</>;
    case "account.update_profile":
      return <>You updated your account profile.</>;
    case "project.create":
      return (
        <>
          You created project{" "}
          <span className="font-medium text-white">
            {event.projectName || "project"}
          </span>
          .
        </>
      );
    case "project.delete":
      return <>You deleted a project.</>;
    case "deployment.create":
      return (
        <>
          You created a deployment in{" "}
          <span className="font-medium text-white">
            {event.projectName || "project"}
          </span>
          .
        </>
      );
    default: {
      const readable = action
        .split(".")
        .join(" ")
        .replace(/_/g, " ");
      return (
        <>
          You performed <span className="text-zinc-200">{readable}</span>
          {event.projectName ? ` in ${event.projectName}` : ""}.
        </>
      );
    }
  }
}

export function AccountActivity({
  events = [],
  userImage,
  userName,
}: AccountActivityProps) {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Time filter
      if (timeFilter !== "all") {
        const eventDate = new Date(event.createdAt).getTime();
        const now = Date.now();
        const diffMs = now - eventDate;
        if (timeFilter === "24h" && diffMs > 24 * 3600 * 1000) return false;
        if (timeFilter === "7d" && diffMs > 7 * 24 * 3600 * 1000) return false;
        if (timeFilter === "30d" && diffMs > 30 * 24 * 3600 * 1000) return false;
      }

      // Category filter
      if (eventCategoryFilter !== "all") {
        if (
          eventCategoryFilter === "auth" &&
          !event.action.startsWith("auth.") &&
          !event.action.startsWith("oauth.")
        ) {
          return false;
        }
        if (
          eventCategoryFilter === "security" &&
          !event.action.includes("2fa") &&
          !event.action.includes("passkey")
        ) {
          return false;
        }
        if (
          eventCategoryFilter === "tokens" &&
          !event.action.includes("token")
        ) {
          return false;
        }
        if (
          eventCategoryFilter === "projects" &&
          !event.action.startsWith("project.") &&
          !event.action.startsWith("deployment.")
        ) {
          return false;
        }
      }

      return true;
    });
  }, [events, timeFilter, eventCategoryFilter]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, DashboardAuditEvent[]>();
    for (const event of filteredEvents) {
      const monthKey = getMonthKey(event.createdAt);
      const list = groups.get(monthKey) ?? [];
      list.push(event);
      groups.set(monthKey, list);
    }
    return Array.from(groups.entries());
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar matching Vercel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-white tracking-tight">Activity</h1>

        <div className="flex items-center gap-2">
          {/* All Time filter */}
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 w-32 rounded-md border-zinc-800 bg-zinc-900/60 px-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">
              <Calendar className="mr-1.5 size-3 text-zinc-400" />
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
              <SelectItem value="all" className="text-xs">
                All Time
              </SelectItem>
              <SelectItem value="24h" className="text-xs">
                Past 24 Hours
              </SelectItem>
              <SelectItem value="7d" className="text-xs">
                Past 7 Days
              </SelectItem>
              <SelectItem value="30d" className="text-xs">
                Past 30 Days
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by Event */}
          <Select value={eventCategoryFilter} onValueChange={setEventCategoryFilter}>
            <SelectTrigger className="h-8 w-36 rounded-md border-zinc-800 bg-zinc-900/60 px-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">
              <Filter className="mr-1.5 size-3 text-zinc-400" />
              <SelectValue placeholder="Filter by Event" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
              <SelectItem value="all" className="text-xs">
                All Events
              </SelectItem>
              <SelectItem value="auth" className="text-xs">
                Authentication
              </SelectItem>
              <SelectItem value="security" className="text-xs">
                Security & 2FA
              </SelectItem>
              <SelectItem value="tokens" className="text-xs">
                Tokens
              </SelectItem>
              <SelectItem value="projects" className="text-xs">
                Projects
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      {groupedEvents.length > 0 ? (
        <div className="space-y-8">
          {groupedEvents.map(([month, monthEvents]) => (
            <div key={month} className="space-y-3">
              <h2 className="text-xs font-semibold text-zinc-400 tracking-tight">
                {month}
              </h2>

              <div className="space-y-1">
                {monthEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-4 py-2 text-xs transition-colors rounded-md px-2 -mx-2 hover:bg-zinc-900/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* User Avatar */}
                      {userImage ? (
                        <Image
                          src={userImage}
                          alt=""
                          width={20}
                          height={20}
                          className="size-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300">
                          {userName ? userName.charAt(0).toUpperCase() : <User className="size-3" />}
                        </span>
                      )}

                      <span className="text-zinc-300 truncate">
                        {renderEventSentence(event)}
                      </span>
                    </div>

                    <time className="shrink-0 text-zinc-500 font-mono text-[11px]">
                      {formatRelativeTime(event.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center">
          <p className="text-xs text-zinc-500">
            No activity found for this period.
          </p>
        </div>
      )}
    </div>
  );
}
