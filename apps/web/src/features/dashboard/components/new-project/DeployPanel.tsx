"use client";

import type { FrameworkId } from "@multivrs/config";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { Spinner } from "@/components/dashboard/Spinner";
import { LiveRocket } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { ImportFacts } from "@/features/dashboard/components/new-project/ImportFacts";
import type { RepositorySource } from "@/features/dashboard/types/deployment-import.types";

/** The summary beside the form, and the one button that ships it. */
export function DeployPanel({
  address,
  blocker,
  framework,
  onDeploy,
  rootDirectory,
  source,
  starting,
}: {
  address: string;
  /** Why Deploy can't run yet, shown under the button; null when it can. */
  blocker: string | null;
  framework: FrameworkId;
  onDeploy: () => void;
  rootDirectory: string;
  source: RepositorySource;
  starting: boolean;
}) {
  return (
    <DashCard aria-label="Deploy">
      <DashCardHeader
        description="Production · from the latest commit"
        icon={LiveRocket}
        title="Ready to deploy"
      />
      <div className="space-y-3 p-5 pt-4">
        <ImportFacts
          address={address}
          framework={framework}
          rootDirectory={rootDirectory}
          source={source}
        />
        <Button
          className="h-11 w-full text-[14px]"
          data-icon-trigger
          disabled={starting || blocker !== null}
          onClick={onDeploy}
          type="button"
          variant="hero"
        >
          {starting ? (
            <Spinner />
          ) : (
            <LiveRocket className="size-4" strokeWidth={1.9} />
          )}
          {starting ? "Starting the build…" : "Deploy"}
        </Button>
        {blocker ? (
          <p
            className="text-center text-xs text-muted-foreground"
            role="status"
          >
            {blocker}
          </p>
        ) : null}
      </div>
    </DashCard>
  );
}
