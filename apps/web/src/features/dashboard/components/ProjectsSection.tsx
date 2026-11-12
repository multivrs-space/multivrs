import { notFound, redirect } from "next/navigation";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { ProjectsGrid } from "@/features/dashboard/components/ProjectsGrid";
import type { ProjectView } from "@/features/dashboard/components/ProjectsToolbar";
import { getServerSession } from "@/lib/auth/session";
import { getAccountUsage } from "@/lib/services/account-usage.service";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { canAccessDashboardWorkspace } from "@/lib/services/dashboard-scope.service";

/** The workspace's project list (or its usage), at /[username]/~/projects. */
export function ProjectsSection({
  username,
  initialView,
}: {
  username: string;
  initialView: ProjectView;
}) {
  const viewer = resolveViewer(username);
  return (
    <PageBody>
      <ProjectsGrid
        initialView={initialView}
        projects={viewer.then((userId) => dashboardProjects(username, userId))}
        usage={viewer.then((userId) => getAccountUsage(userId, username))}
        username={Promise.resolve(username)}
      />
    </PageBody>
  );
}

/** The account's owner or someone on its team; anyone else gets a 404. */
async function resolveViewer(username: string): Promise<string> {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (
    session.user.username !== username &&
    !(await canAccessDashboardWorkspace(session.user.id, username))
  )
    notFound();
  return session.user.id;
}
