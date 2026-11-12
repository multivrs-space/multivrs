"use client";

import type { FrameworkId } from "@multivrs/config";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BuildSettingsFields } from "@/features/dashboard/components/BuildSettingsFields";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { DeployPanel } from "@/features/dashboard/components/DeployPanel";
import { EnvironmentDraftEditor } from "@/features/dashboard/components/EnvironmentDraftEditor";
import { ProjectImportBasics } from "@/features/dashboard/components/ProjectImportBasics";
import { useDeploymentImport } from "@/features/dashboard/hooks/useDeploymentImport";
import { useFrameworkDetection } from "@/features/dashboard/hooks/useFrameworkDetection";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

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
  const [buildOpen, setBuildOpen] = useState(false);
  const [environmentOpen, setEnvironmentOpen] = useState(false);
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

  // Adopt the detected framework unless the user already picked one.
  useEffect(() => {
    if (detection.status !== "detected" || chosenByUser.current) return;
    const framework = detection.result.framework ?? "static";
    setConfig((current) => ({ ...current, framework }));
  }, [detection]);

  const detectedFramework = result?.framework ?? "static";
  const usesDetected = config.framework === detectedFramework;

  return (
    <div className="w-full space-y-6 px-5 py-6 lg:px-8">
      <Link
        href={`/${username}/new`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Choose another repository
      </Link>
      <DashboardPageHeader
        title={`Configure ${source.name}`}
        description="Check the detected settings, then deploy. You can change all of these later."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4 rounded-xl border border-(--hairline) bg-(--ink-raised) p-5">
          <ProjectImportBasics
            config={config}
            detection={detection}
            deploymentDomain={deploymentDomain}
            onChange={setConfig}
            onFrameworkChange={(framework: FrameworkId) => {
              chosenByUser.current = true;
              setConfig((current) => ({ ...current, framework }));
            }}
            onRootCommit={(root) => {
              chosenByUser.current = false;
              setDetectRoot(root);
            }}
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
            onChange={setConfig}
            open={buildOpen}
            onToggle={() => setBuildOpen((value) => !value)}
          />
          <EnvironmentDraftEditor
            config={config}
            onChange={setConfig}
            open={environmentOpen}
            onToggle={() => setEnvironmentOpen((value) => !value)}
          />
        </section>
        <aside className="lg:sticky lg:top-20">
          <DeployPanel
            config={config}
            deployment={deployment}
            disabled={
              deployment.deploying ||
              !source.url ||
              detection.status === "detecting"
            }
            onDeploy={() => deployment.deploy(config)}
            source={source}
          />
        </aside>
      </div>
    </div>
  );
}
