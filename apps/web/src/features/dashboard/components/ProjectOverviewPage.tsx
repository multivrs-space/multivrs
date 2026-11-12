import { BuildWatcher } from "@/features/dashboard/components/deployments/BuildWatcher";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { BranchesCard } from "@/features/dashboard/components/project/BranchesCard";
import { BuildHealthCard } from "@/features/dashboard/components/project/BuildHealthCard";
import { DeploymentTimeline } from "@/features/dashboard/components/project/DeploymentTimeline";
import { ProductionCard } from "@/features/dashboard/components/project/ProductionCard";
import { ProjectDomainsCard } from "@/features/dashboard/components/project/ProjectDomainsCard";
import { ProjectHero } from "@/features/dashboard/components/project/ProjectHero";
import { ProjectPulseCard } from "@/features/dashboard/components/project/ProjectPulseCard";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

/**
 * A project's home: what production serves and how it got there, its traffic,
 * builds and domains, then every branch and the latest history. Running
 * builds keep the page current without a reload.
 */
export function ProjectOverviewPage({
  data,
  username,
}: {
  data: ProjectOverviewData;
  username: string;
}) {
  const base = `/${username}/${data.slug}`;
  const running = data.recentDeployments
    .filter((item) => item.status === "queued" || item.status === "building")
    .map((item) => ({
      projectId: data.id,
      deploymentId: item.id,
      status: item.status,
    }));
  return (
    <PageBody>
      <BuildWatcher builds={running} />
      <ProjectHero base={base} data={data} />
      <ProductionCard base={base} data={data} username={username} />
      <div className="grid items-stretch gap-3 lg:grid-cols-3">
        <ProjectPulseCard base={base} data={data} />
        <BuildHealthCard base={base} data={data} />
        <ProjectDomainsCard base={base} data={data} />
      </div>
      <div className="grid items-start gap-3 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <BranchesCard base={base} data={data} />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <DeploymentTimeline base={base} data={data} />
        </div>
      </div>
    </PageBody>
  );
}
