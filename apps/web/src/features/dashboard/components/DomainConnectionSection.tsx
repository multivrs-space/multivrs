import { Globe2 } from "lucide-react";
import { AssignDomainProjectDialog } from "@/features/dashboard/components/AssignDomainProjectDialog";
import type { DomainDetail } from "@/lib/domains/dns.types";
import type { DomainProjectOption } from "@/lib/services/domain.service";

export function DomainConnectionSection({
  domain,
  projects,
}: {
  domain: DomainDetail;
  projects: DomainProjectOption[];
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Connected project
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose where requests for this domain should be served.
          </p>
        </div>
        {domain.projectId ? null : (
          <AssignDomainProjectDialog
            domainId={domain.id}
            hostname={domain.hostname}
            projects={projects}
          />
        )}
      </div>
      <div className="rounded-xl border border-border bg-foreground/[0.04] p-5">
        {domain.projectId ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe2 className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{domain.hostname}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Routes to {domain.projectName}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {domain.projectSlug}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This domain is not connected to a project yet. DNS can still be
            managed independently.
          </p>
        )}
      </div>
    </section>
  );
}
