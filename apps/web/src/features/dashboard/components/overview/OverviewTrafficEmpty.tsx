import Link from "next/link";
import { LiveArrowUpRight, LiveChartColumn } from "@/components/icons/animated";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

interface OverviewTrafficEmptyProps {
  username: string;
  state: AccountUsage["state"];
  live: number;
  total: number;
}

/** Why there's no traffic to chart, and the one step that changes it. */
export function OverviewTrafficEmpty({
  username,
  state,
  live,
  total,
}: OverviewTrafficEmptyProps) {
  const reason =
    state === "unconfigured"
      ? {
          text: "Request analytics isn't connected on this server, so nothing is being counted yet.",
          next: null,
        }
      : state === "error"
        ? {
            text: "Traffic couldn't load just now. It refreshes every minute.",
            next: null,
          }
        : total === 0
          ? {
              text: "Create a project, and every request its site receives is counted here.",
              next: { label: "Start a project", href: `/${username}/new` },
            }
          : live === 0
            ? {
                text: `None of your ${total === 1 ? "project is" : `${total} projects are`} live yet, so nothing is serving traffic. Once a deploy succeeds, its requests show up here within a minute or two.`,
                next: {
                  label: "See deploys",
                  href: `/${username}/~/deployments`,
                },
              }
            : {
                text: `Your ${live === 1 ? "live site hasn't" : `${live} live sites haven't`} had a request in 14 days. Visit one and it shows up here within a minute or two.`,
                next: {
                  label: "Open projects",
                  href: `/${username}/~/projects`,
                },
              };
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center"
      data-icon-trigger
    >
      <span className="surface-inset grid size-11 place-items-center rounded-tile text-muted-foreground">
        <LiveChartColumn className="size-5" strokeWidth={1.5} />
      </span>
      <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
        {reason.text}
      </p>
      <p className="max-w-md text-[11.5px] text-muted-foreground/70">
        Every request to a live site is counted at the Multivrs edge, across all
        your projects.
      </p>
      {reason.next ? (
        <Link
          className="flex items-center gap-1 text-[13px] font-medium text-primary"
          data-icon-trigger
          href={reason.next.href}
        >
          {reason.next.label}
          <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
        </Link>
      ) : null}
    </div>
  );
}
