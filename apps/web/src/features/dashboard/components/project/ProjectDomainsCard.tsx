import Link from "next/link";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveGlobe, LivePlus } from "@/components/icons/animated";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

/** The built-in address plus any custom domains, with their status. */
export function ProjectDomainsCard({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const builtIn = data.address?.replace(/^https?:\/\//, "");
  const rows = [
    ...(builtIn
      ? [
          {
            hostname: builtIn,
            status: data.production ? "Active" : "Waiting",
            builtIn: true,
          },
        ]
      : []),
    ...data.domains.map((domain) => ({ ...domain, builtIn: false })),
  ];
  return (
    <DashCard aria-label="Domains">
      <DashCardHeader
        action={
          <Link
            className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            data-icon-trigger
            href={`${base}/domains`}
          >
            <LivePlus className="size-3.5" strokeWidth={2} />
            Add
          </Link>
        }
        icon={LiveGlobe}
        title="Domains"
      />
      <ul className="space-y-0.5 p-2 pt-3">
        {rows.map((row) => (
          <li key={row.hostname}>
            <Link
              className="flex items-center gap-2.5 rounded-tile px-3 py-2.5 transition-colors hover:bg-foreground/[0.03]"
              href={
                row.builtIn
                  ? `${base}/domains`
                  : `${base}/domains/${row.hostname}`
              }
            >
              <StatusOrb
                label={row.status}
                tone={row.status === "Active" ? "ready" : "idle"}
              />
              <span className="min-w-0 flex-1 truncate font-geist-mono text-xs">
                {row.hostname}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {row.builtIn ? "Built-in" : row.status}
              </span>
            </Link>
          </li>
        ))}
        {rows.length ? null : (
          <li className="px-3 py-4 text-[13px] text-muted-foreground">
            No domains yet.
          </li>
        )}
      </ul>
    </DashCard>
  );
}
