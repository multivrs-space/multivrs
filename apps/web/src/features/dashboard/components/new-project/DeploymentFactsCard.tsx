import type { FrameworkId } from "@multivrs/config";
import Link from "next/link";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LiveBoxes } from "@/components/icons/animated";
import { buttonVariants } from "@/components/ui/button-variants";
import { ImportFacts } from "@/features/dashboard/components/new-project/ImportFacts";
import type { RepositorySource } from "@/features/dashboard/types/deployment-import.types";

/** Beside a running first build: what is shipping, and its full page. */
export function DeploymentFactsCard({
  detailsHref,
  ...facts
}: {
  address: string;
  detailsHref: string;
  framework: FrameworkId;
  rootDirectory: string;
  source: RepositorySource;
}) {
  return (
    <DashCard aria-label="Deployment">
      <DashCardHeader
        description="Production"
        icon={LiveBoxes}
        title="Deployment"
      />
      <div className="space-y-3 p-5 pt-4">
        <ImportFacts {...facts} />
        <Link
          className={buttonVariants({
            className: "w-full",
            size: "sm",
            variant: "raised",
          })}
          href={detailsHref}
        >
          Open the deployment page
        </Link>
      </div>
    </DashCard>
  );
}
