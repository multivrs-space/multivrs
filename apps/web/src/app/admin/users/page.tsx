import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { getAdminUsers, USERS_PAGE_SIZE } from "@/app/admin/_actions/queries";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { formatWhole } from "@/components/dashboard/lib/format";
import { TeamAvatar } from "@/components/TeamAvatar";

const SEARCH_PARAM = "q";
const PAGE_PARAM = "page";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    credential: "password",
    github: "GitHub",
    google: "Google",
  };
  return labels[provider] ?? provider;
}

/** Deterministic pastel tone from the email, so fallback avatars vary. */
const AVATAR_TONES = [
  "bg-emerald-800",
  "bg-teal-800",
  "bg-cyan-800",
  "bg-sky-800",
  "bg-indigo-800",
  "bg-violet-800",
  "bg-fuchsia-800",
  "bg-rose-800",
];

function avatarTone(email: string): string {
  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_TONES.length;
  return AVATAR_TONES[index] ?? "bg-indigo-800";
}

interface AdminUsersPageProps {
  searchParams: Promise<{ [SEARCH_PARAM]?: string; [PAGE_PARAM]?: string }>;
}

export const instant = false;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { [SEARCH_PARAM]: query = "", [PAGE_PARAM]: pageParam } =
    await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const { rows, total } = await getAdminUsers(query, page);
  const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  const firstIndex = total === 0 ? 0 : (page - 1) * USERS_PAGE_SIZE + 1;
  const lastIndex = Math.min(page * USERS_PAGE_SIZE, total);

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set(SEARCH_PARAM, query);
    params.set(PAGE_PARAM, String(nextPage));
    return `/admin/users?${params.toString()}`;
  };

  return (
    <DashCard>
      <DashCardHeader
        description="Newest first. Search matches email, name or username."
        title={`Users${total > 0 ? ` (${formatWhole(total)})` : ""}`}
        action={
          <form action="/admin/users" className="flex gap-2">
            <input
              aria-label="Search users"
              className="h-8 w-52 rounded-[9px] border border-hairline bg-transparent px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-hairline-strong"
              defaultValue={query}
              name={SEARCH_PARAM}
              placeholder="Search users…"
              type="search"
            />
          </form>
        }
      />

      {rows.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">
          {query ? "No users match that search." : "No users yet."}
        </p>
      ) : (
        <ul aria-label="Users" className="px-2">
          {rows.map((user) => (
            <li
              className="flex items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0"
              key={user.id}
            >
              <TeamAvatar
                alt={user.name || user.email}
                className={
                  user.image
                    ? undefined
                    : `${avatarTone(user.email)} text-white`
                }
                image={user.image}
                name={user.name || user.email}
                size={32}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {user.name || "—"}
                  {user.username ? (
                    <span className="ml-1.5 font-geist-mono text-[11px] text-muted-foreground/70">
                      @{user.username}
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <div className="hidden w-24 shrink-0 text-[12px] text-muted-foreground sm:block">
                {user.providers.length > 0
                  ? user.providers.map(providerLabel).join(", ")
                  : "—"}
              </div>
              <div className="hidden w-16 shrink-0 text-[12px] text-muted-foreground md:block">
                {user.emailVerified ? "Verified" : "Unverified"}
              </div>
              <div className="w-20 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">
                {formatDate(user.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}

      {total > 0 ? (
        <nav
          aria-label="Users pagination"
          className="surface-inset m-2 flex items-center justify-between gap-3 rounded-tile px-3.5 py-2.5 text-[12px] text-muted-foreground"
        >
          <span className="tabular-nums">
            {firstIndex}–{lastIndex} of {formatWhole(total)}
          </span>
          <span aria-hidden="true">
            Page {page} of {pageCount}
          </span>
          <span className="flex items-center gap-1">
            {page > 1 ? (
              <Link
                aria-label="Previous page"
                className="flex size-7 items-center justify-center rounded-[7px] text-foreground transition-colors hover:bg-foreground/5"
                href={buildHref(page - 1)}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center text-muted-foreground/40"
              >
                <ChevronLeft className="size-4" />
              </span>
            )}
            {page < pageCount ? (
              <Link
                aria-label="Next page"
                className="flex size-7 items-center justify-center rounded-[7px] text-foreground transition-colors hover:bg-foreground/5"
                href={buildHref(page + 1)}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center text-muted-foreground/40"
              >
                <ChevronRight className="size-4" />
              </span>
            )}
          </span>
        </nav>
      ) : null}
    </DashCard>
  );
}
