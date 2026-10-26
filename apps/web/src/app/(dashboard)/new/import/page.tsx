import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

/** Reads the URL and session at request time, like the rest of the dashboard. */
export const instant = false;

/** Legacy entry point: keeps old import links working inside the dashboard. */
export default async function NewProjectImportRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([
    getServerSession(),
    searchParams,
  ]);
  if (!session) redirect("/login?redirect=/new");
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const workspace =
    query.get("teamSlug") ?? session.user.username ?? session.user.id;
  query.delete("teamSlug");
  redirect(`/${workspace}/new/import?${query.toString()}`);
}
