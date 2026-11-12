"use client";

import { useState } from "react";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { BuildPhases } from "@/features/dashboard/components/deployments/BuildPhases";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { BuildSettingsFields } from "@/features/dashboard/components/new-project/BuildSettingsFields";
import { DeployPanel } from "@/features/dashboard/components/new-project/DeployPanel";
import { DeployStepsCard } from "@/features/dashboard/components/new-project/DeployStepsCard";
import { DeploySuccess } from "@/features/dashboard/components/new-project/DeploySuccess";
import { EnvironmentDraftEditor } from "@/features/dashboard/components/new-project/EnvironmentDraftEditor";
import { GitHubRepositoryList } from "@/features/dashboard/components/new-project/GitHubRepositoryList";
import { ImportFromUrlCard } from "@/features/dashboard/components/new-project/ImportFromUrlCard";
import { ProjectImportBasics } from "@/features/dashboard/components/new-project/ProjectImportBasics";
import {
  LAB_BUILD_LINES,
  LAB_DETECTION,
  LAB_IMPORT_CONFIG,
  LAB_PROJECT,
  LAB_REPOSITORIES,
  LAB_SOURCE,
} from "@/features/dashboard/lab/lab-new-project-data";
import { buildPhases } from "@/features/dashboard/lib/build-phases";
import { deployBlocker } from "@/features/dashboard/lib/deploy-blocker";

/* The new-project flow with sample data, for the design lab only. */
export function LabNewProjectSamples() {
  const [config, setConfig] = useState(LAB_IMPORT_CONFIG);
  const address = "https://storefront.multivrs.app";
  return (
    <div className="space-y-6">
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <DashCard className="lg:col-span-8">
          <DashCardHeader
            description="acme · 3 repositories"
            mark={<GitHubMark className="size-4" />}
            title="Import from GitHub"
          />
          <GitHubRepositoryList
            frameworks={{ "acme/storefront": "nextjs", "acme/api": "hono" }}
            importingId={null}
            loading={false}
            onImport={() => undefined}
            repositories={LAB_REPOSITORIES}
          />
        </DashCard>
        <div className="grid gap-3 lg:col-span-4">
          <ImportFromUrlCard busy={false} onImport={() => undefined} />
          <DeployStepsCard />
        </div>
      </div>
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <div className="grid min-w-0 gap-3 lg:col-span-8">
          <ProjectImportBasics
            config={config}
            deploymentDomain="multivrs.app"
            detection={LAB_DETECTION}
            onChange={setConfig}
            onFrameworkChange={(framework) =>
              setConfig((current) => ({ ...current, framework }))
            }
            onRootCommit={() => undefined}
            project={null}
          />
          <BuildSettingsFields
            config={config}
            defaults={{
              buildCommand: "next build",
              installCommand: "bun install",
              outputDirectory: ".next",
            }}
            detected
            onChange={setConfig}
          />
          <EnvironmentDraftEditor config={config} onChange={setConfig} />
        </div>
        <div className="lg:col-span-4">
          <DeployPanel
            address={address}
            blocker={deployBlocker(config, "detected", LAB_SOURCE.url)}
            framework={config.framework}
            onDeploy={() => undefined}
            rootDirectory={config.rootDirectory}
            source={LAB_SOURCE}
            starting={false}
          />
        </div>
      </div>
      <div className="grid gap-3">
        {LAB_BUILD_LINES.map((sample) => (
          <DashCard key={sample.label}>
            <DashCardHeader title={sample.label} />
            <div className="p-5 pt-4">
              <BuildPhases phases={buildPhases(sample.lines, sample.status)} />
            </div>
          </DashCard>
        ))}
      </div>
      <DeploySuccess
        address={address}
        detailsHref="/acme/storefront/deployments/dpl_lab"
        phases={buildPhases(LAB_BUILD_LINES[2]?.lines ?? [], "ready")}
        project={LAB_PROJECT}
        total="34s"
        username="acme"
      />
    </div>
  );
}
