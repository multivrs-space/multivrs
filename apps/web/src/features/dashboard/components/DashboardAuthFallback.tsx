import { RouteSkeleton } from "@/features/dashboard/components/shell/RouteSkeleton";
import {
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_NAV_ITEMS,
} from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * A fully static stand-in for the rail shell while the session is verified.
 *
 * This component must not read pathname, params, cookies, headers, or any
 * other request data: Suspense fallbacks render outside the work they guard.
 * RouteSkeleton picks the page shape in the browser, after hydration.
 */
export function DashboardAuthFallback({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      className={cn(
        "dashboard-shell dashboard-surface dashboard-frame min-h-dvh bg-ink text-foreground lg:bg-ink-raised dark:lg:bg-ink",
        className,
      )}
    >
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-(--rail-w) flex-col lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="skeleton size-6 rounded-full" />
          <span className="skeleton h-3 w-28" />
        </div>
        <nav aria-label="Dashboard" className="flex-1 overflow-hidden px-3">
          {DASHBOARD_NAV_GROUPS.map((group) => (
            <section className="mt-3 first:mt-1" key={group.id}>
              {group.label ? (
                <p className="mb-1 px-2.5 font-geist-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/55">
                  {group.label}
                </p>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {DASHBOARD_NAV_ITEMS.filter(
                  (item) => item.group === group.id,
                ).map((item) => (
                  <li
                    className="flex h-9 items-center gap-3 rounded-control px-2.5 text-[13px] text-muted-foreground"
                    key={item.slug}
                  >
                    <item.icon
                      className="size-[18px] opacity-80"
                      strokeWidth={1.75}
                    />
                    <span className="truncate">{item.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      <div className="relative min-w-0 lg:fixed lg:top-(--canvas-inset) lg:right-(--canvas-inset) lg:bottom-(--canvas-inset) lg:left-[calc(var(--rail-w)+var(--canvas-inset))] lg:overflow-hidden lg:rounded-canvas lg:surface-canvas">
        <header className="flex h-14 items-center gap-2.5 border-b border-hairline px-5">
          <span className="skeleton h-8 w-32 rounded-full" />
          <span className="font-geist-mono text-[13px] text-muted-foreground/35">
            /
          </span>
          <span className="skeleton h-3 w-20" />
          <span className="ml-auto hidden items-center gap-2 lg:flex">
            <span className="skeleton h-9 w-64 rounded-control" />
            <span className="skeleton size-9 rounded-full" />
            <span className="skeleton size-9 rounded-full" />
          </span>
        </header>
        <div className="lg:h-[calc(100%-3.5rem)] lg:overflow-y-auto">
          <RouteSkeleton />
        </div>
      </div>
    </div>
  );
}
