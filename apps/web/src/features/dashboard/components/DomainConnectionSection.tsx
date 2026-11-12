import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { StatusOrb } from "@/components/dashboard/StatusOrb";
import { LiveLayoutGrid } from "@/components/icons/animated";
import { AssignDomainProjectDialog } from "@/features/dashboard/components/AssignDomainProjectDialog";
import type { DomainDetail } from "@/lib/domains/dns.types";
import type { DomainProjectOption } from "@/lib/services/domain.service";

/** Which project answers requests for this domain. */
export function DomainConnectionSection({
  domain,
  projects,
}: {
  domain: DomainDetail;
  projects: DomainProjectOption[];
}) {
  return (
    <DashCard aria-label="Connected project">
      <DashCardHeader
        action={
          domain.projectId ? null : (
            <AssignDomainProjectDialog
              domainId={domain.id}
              hostname={domain.hostname}
              projects={projects}
            />
          )
        }
        description="Where requests for this domain are served"
        icon={LiveLayoutGrid}
        title="Connected project"
      />
      <div className="p-5 pt-4">
        {domain.projectId ? (
          <div className="surface-inset flex items-center justify-between gap-4 rounded-tile px-4 py-3">
            <div className="flex items-center gap-3">
              <StatusOrb label="Connected" tone="ready" />
              <div>
                <p className="text-[13.5px] font-medium">
                  {domain.projectName}
                </p>
                <p className="mt-0.5 font-geist-mono text-[11.5px] text-muted-foreground">
                  {domain.hostname} → {domain.projectSlug}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">
            Not connected to a project yet. You can still manage its DNS below.
          </p>
        )}
      </div>
    </DashCard>
  );
}
