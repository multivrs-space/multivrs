import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { EnvironmentVariableForm } from "@/features/dashboard/components/EnvironmentVariableForm";
import { EnvironmentVariableRows } from "@/features/dashboard/components/EnvironmentVariableRows";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type { DashboardEnvironmentVariable } from "@/features/dashboard/types/environment-variable.types";

/** Encrypted build and runtime configuration for one project. */
export function EnvironmentVariablesPage({
  projectId,
  projectName,
  variables,
}: {
  projectId: string;
  projectName: string;
  variables: DashboardEnvironmentVariable[];
}) {
  return (
    <PageBody>
      <DashboardPageHeader
        description="Changes apply to new deployments. Redeploy after changing a build-time variable."
        eyebrow={`${projectName} · Configure`}
        title="Environment variables"
      />
      <EnvironmentVariableForm projectId={projectId} />
      <EnvironmentVariableRows projectId={projectId} variables={variables} />
    </PageBody>
  );
}
