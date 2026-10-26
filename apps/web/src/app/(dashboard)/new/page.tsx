import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

/** Reads the URL and session at request time, like the rest of the dashboard. */
export const instant = false;

/** Legacy entry point: New Project now lives inside the workspace dashboard. */
export default async function NewProjectRedirect() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/new");
  redirect(`/${session.user.username ?? session.user.id}/new`);
}
