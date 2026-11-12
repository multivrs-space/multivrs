"use client";

import { useState } from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import { LiveHistory } from "@/components/icons/animated";
import {
  type ActivityCategory,
  type ActivityWindow,
  activityCategory,
  byMonth,
  describeActivity,
  inWindow,
} from "@/features/dashboard/components/account/activity/activity-events";
import {
  ACTIVITY_KINDS as CATEGORIES,
  ACTIVITY_ICONS as ICONS,
  ACTIVITY_WINDOWS as WINDOWS,
} from "@/features/dashboard/components/account/activity/activity-filters";
import {
  SettingsCard,
  SettingsCardBody,
} from "@/features/dashboard/components/settings/SettingsCard";
import { relativeTime } from "@/features/dashboard/lib/relative-time";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

/** Everything done on the account, newest first, as a timeline by month. */
export function AccountActivity({
  events = [],
}: {
  events: DashboardAuditEvent[];
  userImage?: string | null;
  userName?: string | null;
}) {
  const [category, setCategory] = useState<"all" | ActivityCategory>("all");
  const [period, setPeriod] = useState<ActivityWindow>("all");
  const shown = events.filter(
    (event) =>
      (category === "all" || activityCategory(event.action) === category) &&
      inWindow(event.createdAt, period),
  );

  return (
    <SettingsCard id="activity">
      <SettingsCardBody
        description="Sign-ins, security changes, tokens and projects, newest first."
        icon={LiveHistory}
        title="Activity"
      >
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            aria-label="Filter by kind"
            onChange={setCategory}
            options={CATEGORIES}
            value={category}
          />
          <SegmentedControl
            aria-label="Filter by time"
            onChange={setPeriod}
            options={WINDOWS}
            value={period}
          />
        </div>
      </SettingsCardBody>
      {shown.length ? (
        <div className="space-y-6 px-5 pb-5 sm:px-6">
          {byMonth(shown).map(([month, items]) => (
            <section aria-label={month} key={month}>
              <h3 className="mb-2 font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {month}
              </h3>
              <ol className="relative space-y-1 before:absolute before:inset-y-3 before:left-[17px] before:w-px before:bg-hairline-strong">
                {items.map((event) => {
                  const Icon = ICONS[activityCategory(event.action)];
                  return (
                    <li
                      className="relative flex items-center gap-3 rounded-tile py-1.5 pr-2"
                      data-icon-trigger
                      key={event.id}
                    >
                      <span className="surface-raised relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[13px] text-foreground/85">
                        <ActivitySentence event={event} />
                      </p>
                      <time
                        className="shrink-0 text-[11.5px] text-muted-foreground"
                        dateTime={event.createdAt}
                        suppressHydrationWarning
                      >
                        {relativeTime(event.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          className="pt-2"
          description={
            events.length
              ? "Nothing matches these filters."
              : "Sign-ins, security changes and new projects show up here."
          }
          glyph={LiveHistory}
          title={events.length ? "No matching activity" : "No activity yet"}
        />
      )}
    </SettingsCard>
  );
}

function ActivitySentence({ event }: { event: DashboardAuditEvent }) {
  const sentence = describeActivity(event);
  return (
    <>
      {sentence.before}
      {sentence.strong ? (
        <strong className="font-semibold text-foreground">
          {sentence.strong}
        </strong>
      ) : null}
      {sentence.after}
    </>
  );
}
