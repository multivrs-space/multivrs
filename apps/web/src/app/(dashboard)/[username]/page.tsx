import { WorkspaceOverview } from "@/features/dashboard/components/overview/WorkspaceOverview";

/**
 * The workspace home at /[username]: every layer of the stack at a glance.
 * `params` is handed down unresolved; each card awaits it inside its own
 * Suspense boundary, so navigation shows the page shell instantly.
 */
export default function DashboardPage({ params }: PageProps<"/[username]">) {
  return (
    <WorkspaceOverview username={params.then((value) => value.username)} />
  );
}
