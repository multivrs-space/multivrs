"use client";

import { useState } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatCompact } from "@/components/dashboard/lib/format";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveBug } from "@/components/icons/animated";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { ErrorIssueRow } from "@/features/dashboard/components/errors/ErrorIssueRow";
import { ObserveSources } from "@/features/dashboard/components/observe/ObserveSources";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type { ErrorIssue } from "@/features/dashboard/types/error-issue.types";

type Sort = "recent" | "events" | "new";
const SORTS: Record<Sort, (a: ErrorIssue, b: ErrorIssue) => number> = {
  recent: (a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen),
  events: (a, b) => b.count - a.count,
  new: (a, b) => Date.parse(b.firstSeen) - Date.parse(a.firstSeen),
};

/**
 * Error tracking: every runtime exception grouped into an issue, with its
 * trend, reach and newest occurrence. Fourteen days, newest activity first.
 */
export function ErrorsPage({
  issues,
  events,
  truncated,
  scopeName,
  workspace,
  projects,
}: {
  issues: ErrorIssue[];
  events: number;
  truncated: boolean;
  scopeName: string;
  workspace: boolean;
  projects: [string, { name: string; href: string }][];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const links = new Map(projects);
  const needle = query.trim().toLowerCase();
  const rows = issues
    .filter((issue) =>
      `${issue.type} ${issue.title} ${issue.latest.message}`
        .toLowerCase()
        .includes(needle),
    )
    .sort(SORTS[sort]);
  const fresh = issues.filter((issue) => issue.isNew).length;
  const today = issues.reduce(
    (sum, issue) => sum + (issue.daily.at(-1) ?? 0),
    0,
  );

  return (
    <PageBody wide>
      <DashboardPageHeader
        description="Exceptions your code threw, grouped by cause, over the last 14 days."
        eyebrow={`${scopeName} · Observe`}
        title="Errors"
      />
      <ObserveSources external="an SDK" projects={projects.length} />
      <StatStrip
        stats={[
          {
            label: "Issues",
            value: formatCompact(issues.length),
            hint: "Distinct causes",
          },
          {
            label: "Events",
            value: `${formatCompact(events)}${truncated ? "+" : ""}`,
            hint: "Last 14 days",
          },
          {
            label: "Today",
            value: formatCompact(today),
            hint: "Events since 00:00 UTC",
            tone: today ? "danger" : "default",
          },
          {
            label: "New issues",
            value: formatCompact(fresh),
            hint: "First seen in 24 hours",
            tone: fresh ? "warn" : "default",
          },
        ]}
      />
      {issues.length ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardSearchInput
              containerClassName="min-w-56 flex-1"
              onValueChange={setQuery}
              placeholder="Search error types and messages"
              value={query}
            />
            <SegmentedControl
              aria-label="Sort"
              onChange={setSort}
              options={[
                { value: "recent", label: "Last seen" },
                { value: "events", label: "Most events" },
                { value: "new", label: "Newest" },
              ]}
              value={sort}
            />
          </div>
          <DashCard>
            {rows.map((issue) => (
              <ErrorIssueRow
                issue={issue}
                key={issue.id}
                projects={links}
                workspace={workspace}
              />
            ))}
            {rows.length ? null : (
              <p className="p-12 text-center text-[13px] text-muted-foreground">
                No issues match “{query}”.
              </p>
            )}
          </DashCard>
        </>
      ) : (
        <DashCard>
          <EmptyState
            description="Nothing your code threw in the last 14 days. Errors logged by your deployments group here by cause."
            glyph={LiveBug}
            title="No errors"
          />
        </DashCard>
      )}
    </PageBody>
  );
}
