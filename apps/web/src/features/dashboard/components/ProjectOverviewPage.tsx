import { DeploymentTimeline } from "@/features/dashboard/components/project/DeploymentTimeline";
import { DeployPipeline } from "@/features/dashboard/components/project/DeployPipeline";
import { ProjectDomainsCard } from "@/features/dashboard/components/project/ProjectDomainsCard";
import { ProjectHero } from "@/features/dashboard/components/project/ProjectHero";
import { ProjectPulseCard } from "@/features/dashboard/components/project/ProjectPulseCard";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

export function ProjectOverviewPage({
  data,
  username,
}: {
  data: ProjectOverviewData;
  username: string;
}) {
  const base = `/${username}/${data.slug}`;
  return (
    <div className="w-full space-y-6 px-5 py-6 lg:px-8">
      <ProjectHero base={base} data={data} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <DeployPipeline base={base} data={data} />
          <DeploymentTimeline base={base} data={data} />
        </div>
        <aside className="space-y-6">
          <ProjectPulseCard base={base} data={data} />
          <ProjectDomainsCard base={base} data={data} />
        </aside>
      </div>
    </div>
  );
}
