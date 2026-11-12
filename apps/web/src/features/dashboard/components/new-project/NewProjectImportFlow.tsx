"use client";

import type { FrameworkId } from "@multivrs/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { BuildSettingsFields } from "@/features/dashboard/components/new-project/BuildSettingsFields";
import { DeployPanel } from "@/features/dashboard/components/new-project/DeployPanel";
import { EnvironmentDraftEditor } from "@/features/dashboard/components/new-project/EnvironmentDraftEditor";
import { ImportDeployView } from "@/features/dashboard/components/new-project/ImportDeployView";
import { ProjectImportBasics } from "@/features/dashboard/components/new-project/ProjectImportBasics";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { useDeploymentImport } from "@/features/dashboard/hooks/useDeploymentImport";
import { useFrameworkDetection } from "@/features/dashboard/hooks/useFrameworkDetection";
import { warmBuildMachine } from "@/features/dashboard/lib/build-warmup.client";
import { deployBlocker } from "@/features/dashboard/lib/deploy-blocker";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";
import { slugify } from "@/lib/services/slug";

/** Step two: check what Multivrs detected, deploy, and watch it go live. */
export function NewProjectImportFlow({
  deploymentDomain,
  username,
}: {
  deploymentDomain: string;
  username: string;
}) {
  const search = useSearchParams();
  const requestedBranch = search.get("branch") ?? "";
  const repositoryName = search.get("name") || "repository";
  const repositoryOwner = search.get("owner") || "";
  const [config, setConfig] = useState<DeploymentImportConfig>({
    buildCommand: "",
    environment: [{ id: "initial", key: "", value: "" }],
    framework: "static",
    installCommand: "",
    outputDirectory: "",
    projectName: repositoryName,
    rootDirectory: ".",
  });
  const [detectRoot, setDetectRoot] = useState(".");
  const chosenByUser = useRef(false);
  const detection = useFrameworkDetection({
    owner: repositoryOwner,
    repo: repositoryName,
    ref: requestedBranch,
    root: detectRoot,
  });
  const result = detection.status === "detected" ? detection.result : null;
  const source: RepositorySource = {
    // URL imports carry no branch; detection resolves the default one.
    branch: requestedBranch || result?.ref || "main",
    name: repositoryName,
    owner: repositoryOwner,
    team: username,
    url: search.get("s") || "",
  };
  const deployment = useDeploymentImport(source);
  const slug = deployment.project?.slug ?? slugify(config.projectName);
  const address = `https://${slug}.${deploymentDomain}`;

  // Boot the build machine while the form is being checked, not after Deploy.
  useEffect(() => warmBuildMachine({ account: username }), [username]);

  // Adopt the detected framework unless the user already picked one.
  useEffect(() => {
    if (detection.status !== "detected" || chosenByUser.current) return;
    const framework = detection.result.framework ?? "static";
    setConfig((current) => ({ ...current, framework }));
  }, [detection]);

  const usesDetected = config.framework === (result?.framework ?? "static");
  const facts = {
    address,
    framework: config.framework,
    rootDirectory: config.rootDirectory,
    source,
  };

  return (
    <PageBody>
      <BackLink href={`/${username}/new`} label="Choose another repository" />
      {deployment.started ? (
        <ImportDeployView
          {...facts}
          key={deployment.started.deploymentId}
          onEdit={deployment.edit}
          onRetry={() => void deployment.deploy(config)}
          retrying={deployment.starting}
          started={deployment.started}
          username={username}
        />
      ) : (
        <>
          <DashboardPageHeader
            description="Multivrs filled these in from the repository. Change anything you need, then deploy. All of it can be edited later."
            eyebrow={`${source.owner}/${source.name} · ${source.branch}`}
            title={`Configure ${source.name}`}
          />
          <div className="grid items-start gap-3 lg:grid-cols-12">
            <div className="grid min-w-0 gap-3 lg:col-span-8">
              <ProjectImportBasics
                config={config}
                deploymentDomain={deploymentDomain}
                detection={detection}
                onChange={setConfig}
                onFrameworkChange={(framework: FrameworkId) => {
                  chosenByUser.current = true;
                  setConfig((current) => ({ ...current, framework }));
                }}
                onRootCommit={(root) => {
                  chosenByUser.current = false;
                  setDetectRoot(root);
                }}
                project={deployment.project}
              />
              <BuildSettingsFields
                config={config}
                defaults={{
                  buildCommand: usesDetected
                    ? (result?.buildCommand ?? null)
                    : null,
                  installCommand: result
                    ? `${result.packageManager} install`
                    : null,
                  outputDirectory: usesDetected
                    ? (result?.outputDirectory ?? null)
                    : null,
                }}
                detected={result !== null}
                onChange={setConfig}
              />
              <EnvironmentDraftEditor config={config} onChange={setConfig} />
            </div>
            <aside className="lg:sticky lg:top-[calc(var(--topbar-h)+1.25rem)] lg:col-span-4">
              <DeployPanel
                {...facts}
                blocker={deployBlocker(config, detection.status, source.url)}
                onDeploy={() => void deployment.deploy(config)}
                starting={deployment.starting}
              />
            </aside>
          </div>
        </>
      )}
    </PageBody>
  );
}
