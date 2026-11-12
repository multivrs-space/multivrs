import Link from "next/link";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  LiveArrowUpRight,
  LiveGlobe,
  LiveRefresh,
} from "@/components/icons/animated";
import type { DashboardDomain } from "@/lib/services/domain.service";
import { cn } from "@/lib/utils";
import { DomainActions } from "./DomainActions";

/** One domain: where it points, whether it's live, and when it renews. */
export function DomainRow({
  domain,
  detailUrl,
}: {
  domain: DashboardDomain;
  detailUrl: string;
}) {
  const active = domain.status === "Active";
  return (
    <div className="group relative flex min-h-16 items-center gap-3 rounded-tile px-3 py-2.5 transition-colors hover:bg-foreground/[0.03] sm:gap-4">
      <span className="surface-inset relative grid size-9 shrink-0 place-items-center rounded-tile text-muted-foreground">
        <LiveGlobe className="size-4" strokeWidth={1.75} />
        <StatusOrb
          className="absolute -right-0.5 -top-0.5"
          label={domain.status}
          tone={active ? "ready" : "building"}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link
            className="truncate font-geist-mono text-[13.5px] font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:after:ring-2 focus-visible:after:ring-ring"
            href={detailUrl}
          >
            {domain.name}
          </Link>
          <a
            aria-label={`Open ${domain.name}`}
            className="relative z-10 grid size-6 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
            data-icon-trigger
            href={`https://${domain.name}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <LiveArrowUpRight className="size-3.5" strokeWidth={2} />
          </a>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          {domain.managed ? (
            <>
              <LiveRefresh className="size-3 shrink-0" strokeWidth={2} />
              {domain.autoRenew ? "Renews" : "Expires"} {domain.renewalLabel}
            </>
          ) : (
            "Third-party registrar"
          )}
        </p>
      </div>
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] md:inline-flex",
          domain.project === "Unconnected"
            ? "bg-foreground/5 text-muted-foreground"
            : "bg-primary/10 text-primary",
        )}
      >
        {domain.project}
      </span>
      <span
        className={cn(
          "hidden w-16 shrink-0 text-right text-[12px] font-medium sm:block",
          active
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-amber-700 dark:text-amber-300",
        )}
      >
        {domain.status}
      </span>
      <div className="relative z-10">
        <DomainActions
          detailUrl={detailUrl}
          domainId={domain.id}
          hostname={domain.name}
          initialAutoRenew={domain.autoRenew}
        />
      </div>
    </div>
  );
}
