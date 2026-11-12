import { LiveArrowUpRight } from "@/components/icons/animated";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";

/**
 * The live site's icon and address on a framed tile that opens it: what the
 * production card shows before its screenshot loads, or when none exists.
 * It never loads the site itself, so viewing it adds no visits or requests.
 */
export function SiteIdentity({
  address,
  faviconUrl,
  name,
}: {
  address: string;
  faviconUrl: string | null;
  name: string;
}) {
  const host = address.replace(/^https?:\/\//, "");
  return (
    <a
      aria-label={`Open ${host}`}
      className="surface-inset group relative flex aspect-[16/10] flex-col overflow-hidden rounded-tile"
      data-icon-trigger
      href={address}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex h-8 shrink-0 items-center gap-2 border-b border-hairline px-3">
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-full bg-foreground/[0.05] px-3 py-0.5 font-geist-mono text-[10.5px] text-muted-foreground">
          {host}
        </span>
      </span>
      <span className="relative grid flex-1 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
        />
        <span className="relative flex flex-col items-center gap-3">
          <span className="surface-raised grid size-16 place-items-center rounded-[18px]">
            <ProjectFavicon className="size-9" name={name} url={faviconUrl} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {name}
          </span>
        </span>
        <span className="surface-raised absolute right-3 bottom-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Visit <LiveArrowUpRight className="size-3" strokeWidth={2.25} />
        </span>
      </span>
    </a>
  );
}
