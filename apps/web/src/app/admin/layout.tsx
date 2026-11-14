import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAdminAccess } from "@/lib/auth/admin-access";
import { geistMono, hankenGrotesk } from "@/lib/dashboard-fonts";
import { AdminTabs } from "./_components/AdminTabs";

export const instant = false;

export const metadata: Metadata = {
  title: "Team admin",
  robots: { index: false, follow: false },
};

/**
 * Shell for the internal, read-only admin area. The allowlist check lives in
 * this layout so every page under /admin is gated by construction: visitors
 * who are not on the team get a 404, as if the route did not exist.
 *
 * `admin` is a reserved username (see auth plugins), so this path can never
 * be shadowed by a workspace route.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${hankenGrotesk.variable} ${geistMono.variable} dashboard-surface dashboard-frame min-h-dvh bg-ink-raised text-foreground dark:bg-ink`}
    >
      <main className="mx-auto max-w-[1280px] space-y-6 px-5 py-10">
        <Suspense fallback={<AdminShellFallback />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

async function AdminGate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getAdminAccess();
  if (!access.allowed) notFound();

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Multivrs internal
          </p>
          <h1 className="mt-1.5 text-[32px] font-semibold tracking-[-0.03em]">
            Team admin
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Read-only. Signed in as {access.session.user.email}
          </p>
        </div>
        <AdminTabs />
      </header>
      {children}
    </>
  );
}

/**
 * Static stand-in shown while the session/allowlist check resolves. Must not
 * read pathname, params, cookies, headers, or any other request data —
 * Suspense fallbacks render outside the work they guard.
 */
function AdminShellFallback() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Multivrs internal
        </p>
        <div className="mt-3 h-8 w-48 animate-pulse rounded-control bg-foreground/5" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded-control bg-foreground/5" />
      </div>
      <div className="h-10 w-44 animate-pulse rounded-card border border-hairline bg-foreground/5" />
    </header>
  );
}
