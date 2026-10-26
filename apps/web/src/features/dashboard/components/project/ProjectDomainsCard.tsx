import { Globe2, Plus } from "lucide-react";
import Link from "next/link";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";
import { cn } from "@/lib/utils";

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
    <section className="rounded-xl border border-(--hairline) bg-(--ink-raised) p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Domains</h2>
        <Link
          href={`${base}/domains`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" /> Add
        </Link>
      </div>
      <ul className="mt-3 space-y-1">
        {rows.map((row) => (
          <li key={row.hostname}>
            <Link
              href={
                row.builtIn
                  ? `${base}/domains`
                  : `${base}/domains/${row.hostname}`
              }
              className="flex items-center gap-2.5 rounded-md px-2 py-2 -mx-2 hover:bg-foreground/[0.03]"
            >
              <Globe2 className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {row.hostname}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  row.status === "Active"
                    ? "text-emerald-300"
                    : "text-muted-foreground",
                )}
              >
                {row.status}
              </span>
            </Link>
          </li>
        ))}
        {!rows.length ? (
          <li className="py-3 text-xs text-muted-foreground">
            No domains yet.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
