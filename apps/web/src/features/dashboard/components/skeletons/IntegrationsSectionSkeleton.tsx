import {
  SkeletonCard,
  SkeletonHeader,
} from "@/components/dashboard/SkeletonCard";
import { PageBody } from "@/features/dashboard/components/PageBody";

const FIELDS = ["issuer", "audience"];
const PROVIDERS = ["aws", "gcp", "azure"];

/** Mirrors Integrations: the OIDC card beside the cloud provider steps. */
export function IntegrationsSectionSkeleton() {
  return (
    <PageBody>
      <main aria-busy aria-label="Loading integrations" className="space-y-5">
        <SkeletonHeader />
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <SkeletonCard>
            <div className="space-y-4">
              {FIELDS.map((field) => (
                <div key={field}>
                  <span className="skeleton block h-2.5 w-14" />
                  <span className="skeleton mt-2 block h-9 rounded-control" />
                </div>
              ))}
              <span className="skeleton block h-8 w-44 rounded-full" />
            </div>
          </SkeletonCard>
          <SkeletonCard>
            <div className="space-y-2">
              {PROVIDERS.map((provider) => (
                <span
                  className="skeleton block h-14 rounded-tile"
                  key={provider}
                />
              ))}
            </div>
          </SkeletonCard>
        </div>
      </main>
    </PageBody>
  );
}
