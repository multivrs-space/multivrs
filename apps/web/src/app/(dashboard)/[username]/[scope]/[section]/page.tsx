import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { DeploymentsPage } from "@/features/dashboard/components/DeploymentsPage";
import { DomainsPage } from "@/features/dashboard/components/DomainsPage";
import { LogsSection } from "@/features/dashboard/components/logs/LogsSection";
import {
  isObserveSection,
  ObserveSection,
} from "@/features/dashboard/components/observe/ObserveSection";
import { ObserveTabs } from "@/features/dashboard/components/observe/ObserveTabs";
import { PlatformSectionStream } from "@/features/dashboard/components/PlatformSectionStream";
import { ProjectSettingsPage } from "@/features/dashboard/components/ProjectSettingsPage";
import { ProjectsSection } from "@/features/dashboard/components/ProjectsSection";
import { SectionPlaceholder } from "@/features/dashboard/components/SectionPlaceholder";
import { TeamSettingsPage } from "@/features/dashboard/components/TeamSettingsPage";
import { TemplatesDashboard } from "@/features/dashboard/components/TemplatesDashboard";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import {
  canonicalSectionSlug,
  getSectionMeta,
} from "@/features/dashboard/constants/sections";
import { isPlatformProjectSection } from "@/features/dashboard/lib/project-platform-sections";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import { getServerSession } from "@/lib/auth/session";
import { ensureAccountTeam } from "@/lib/services/account-team.service";
import { getBillingOverview } from "@/lib/services/billing-overview.service";
import { dashboardDeployments } from "@/lib/services/dashboard-deployments.service";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import {
  dashboardDomains,
  domainProjectOptions,
} from "@/lib/services/domain.service";
import { getProject } from "@/lib/services/project.service";
import {
  getSellerTemplates,
  getTemplateCategories,
  getTemplateStacks,
} from "@/sanity/lib/template.service";

/**
 * Section pages, e.g. /c-tech/~/cdn (all projects) or
 * /c-tech/kontinue-ai/cdn (one project). `scope` is `~` or a project slug.
 */
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; scope: string; section: string }>;
  searchParams: Promise<{ compose?: string; range?: string; view?: string }>;
}) {
  const { username, scope, section: requestedSection } = await params;
  const section = canonicalSectionSlug(requestedSection);
  const meta = getSectionMeta(section);
  if (!meta) {
    notFound();
  }

  if (section === "projects") {
    if (scope !== ALL_PROJECTS_SCOPE)
      redirect(`/${username}/${ALL_PROJECTS_SCOPE}/projects`);
    const { view } = await searchParams;
    return (
      <ProjectsSection
        initialView={view === "usage" ? "usage" : "projects"}
        username={username}
      />
    );
  }

  if (section === "deployments") {
    const session = await getServerSession();
    if (!session) notFound();
    const deployments = dashboardDeployments(
      session.user.id,
      username,
      scope === ALL_PROJECTS_SCOPE ? undefined : scope,
    );
    return <DeploymentsPage deployments={deployments} />;
  }

  if (section === "logs")
    return <LogsSection scope={scope} username={username} />;

  if (isObserveSection(section)) {
    const { range } = await searchParams;
    return (
      <ObserveTabs scope={scope} section={section} username={username}>
        <ObserveSection
          range={range === "24h" || range === "30d" ? range : "7d"}
          scope={scope}
          section={section}
          username={username}
        />
      </ObserveTabs>
    );
  }

  // Traces sit under Performance; the view itself is Monitoring's traces view.
  if (section === "traces") {
    return (
      <ObserveTabs scope={scope} section={section} username={username}>
        <PlatformSectionStream
          analyticsRange="24h"
          meta={meta}
          requestedView="traces"
          scope={scope}
          section="observability"
          username={username}
        />
      </ObserveTabs>
    );
  }

  if (section === "settings" && scope === ALL_PROJECTS_SCOPE) {
    const session = await getServerSession();
    if (!session) notFound();
    const [billing, team] = await Promise.all([
      getBillingOverview(session.user.id),
      ensureAccountTeam(session.user.id),
    ]);
    return (
      <TeamSettingsPage
        initialTeam={team}
        billing={billing}
        username={username}
      />
    );
  }

  if (section === "settings") {
    const session = await getServerSession();
    if (!session) notFound();
    const scopedProject = await getScopedProject(
      session.user.id,
      username,
      scope,
    );
    const project = await getProject(session.user.id, scopedProject.id);
    return (
      <ProjectSettingsPage
        key={project.id}
        project={project}
        username={username}
      />
    );
  }

  if (section === "domains") {
    const session = await getServerSession();
    if (!session) notFound();
    const projectSlug = scope === ALL_PROJECTS_SCOPE ? undefined : scope;
    const [domains, projects] = await Promise.all([
      dashboardDomains(session.user.id, username, projectSlug),
      domainProjectOptions(session.user.id, username, projectSlug),
    ]);
    return (
      <DomainsPage
        domains={domains}
        projects={projects}
        teamSlug={username}
        scope={scope}
      />
    );
  }

  if (section === "templates") {
    await connection();
    const session = await getServerSession();
    if (!session) notFound();
    const [categories, stacks, templates] = await Promise.all([
      getTemplateCategories(),
      getTemplateStacks(),
      getSellerTemplates(session.user.id),
    ]);
    return (
      <TemplatesDashboard
        categories={categories}
        stacks={stacks}
        templates={templates}
      />
    );
  }

  if (isPlatformProjectSection(section)) {
    const mailSearch = await searchParams;
    return (
      <ObserveTabs scope={scope} section={section} username={username}>
        <PlatformSectionStream
          compose={mailSearch.compose}
          analyticsRange={parseAnalyticsRange(mailSearch.range)}
          meta={meta}
          requestedView={mailSearch.view}
          scope={scope}
          section={section}
          username={username}
        />
      </ObserveTabs>
    );
  }

  const scopeLabel = scope === ALL_PROJECTS_SCOPE ? "All Projects" : scope;

  return (
    <SectionPlaceholder
      title={meta.title}
      description={meta.description}
      scopeLabel={scopeLabel}
    />
  );
}

function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  return value === "7d" || value === "30d" ? value : "24h";
}
