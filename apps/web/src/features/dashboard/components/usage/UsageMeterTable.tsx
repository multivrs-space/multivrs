"use client";

import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveListFilter } from "@/components/icons/animated";
import { UsageMeterRow } from "@/features/dashboard/components/usage/UsageMeterRow";
import { USAGE_GROUPS } from "@/features/dashboard/components/usage/usage-groups";
import { meterShare } from "@/features/dashboard/lib/usage-meters";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

type Filter = "used" | "all";

/**
 * Every meter in one card: each layer a full-width section, its meters in
 * a two-column grid, so rows line up across the whole page.
 */
export function UsageMeterTable({
  meters,
}: {
  meters: AccountUsage["meters"];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const used = (key: string) => (meters[key]?.used ?? 0) > 0;
  const groups = USAGE_GROUPS.map((group) => ({
    ...group,
    rows:
      filter === "all" ? group.rows : group.rows.filter((row) => used(row.key)),
  })).filter((group) => group.rows.length);
  const inUse = USAGE_GROUPS.flatMap((group) => group.rows).filter((row) =>
    used(row.key),
  ).length;

  return (
    <DashCard aria-label="All meters">
      <DashCardHeader
        action={
          <SegmentedControl
            aria-label="Show"
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "used", label: "In use", count: inUse },
            ]}
            value={filter}
          />
        }
        description="This billing period in UTC, updated every minute"
        icon={LiveListFilter}
        title="All meters"
      />
      <div className="p-2 pt-4">
        {groups.map((group) => {
          const Icon = group.icon;
          const near = group.rows.filter(
            (row) => (meterShare(meters[row.key]) ?? 0) >= 0.75,
          ).length;
          return (
            <section aria-label={group.label} className="pb-3" key={group.id}>
              <h3
                className="flex items-center gap-2 px-3 pb-1 pt-3"
                data-icon-trigger
              >
                <Icon
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="text-[13px] font-semibold">{group.label}</span>
                <span className="font-geist-mono text-[10.5px] text-muted-foreground">
                  {group.rows.length}
                </span>
                {near ? (
                  <span className="rounded-full bg-amber-500/12 px-2 py-px text-[10.5px] font-medium text-amber-700 dark:text-amber-300">
                    {near} near the plan
                  </span>
                ) : null}
              </h3>
              <div className="grid md:grid-cols-2 md:gap-x-4">
                {group.rows.map((row) => (
                  <div className="border-t border-hairline" key={row.key}>
                    <UsageMeterRow meter={meters[row.key]} row={row} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {groups.length ? null : (
          <p className="p-12 text-center text-[13px] text-muted-foreground">
            Nothing has been used yet this period.
          </p>
        )}
      </div>
    </DashCard>
  );
}
