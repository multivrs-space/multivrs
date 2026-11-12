"use client";

import type { Project } from "@multivrs/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  createImportProject,
  queueImportDeployment,
  saveImportEnvironment,
  updateImportProject,
} from "@/features/dashboard/lib/deployment-import.client";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";
import { readableError } from "@/lib/api/request.client";

export interface StartedDeployment {
  project: Project;
  deploymentId: string;
  /** When Deploy was pressed, for the elapsed clock. */
  startedAt: string;
}

/**
 * Creates the project once, saves its variables and queues the first build.
 * A retry after a failed build reuses the same project instead of making a
 * second one; following the build itself is `useLiveBuild`'s job.
 */
export function useDeploymentImport(source: RepositorySource) {
  const [project, setProject] = useState<Project | null>(null);
  const [started, setStarted] = useState<StartedDeployment | null>(null);
  const [starting, setStarting] = useState(false);

  async function deploy(config: DeploymentImportConfig) {
    if (!config.projectName.trim()) {
      toast.error("Enter a project name");
      return;
    }
    setStarting(true);
    try {
      const current = project
        ? await updateImportProject(project, config)
        : await createImportProject(config, source);
      setProject(current);
      await saveImportEnvironment(current.id, config.environment);
      const deployment = await queueImportDeployment(
        current.id,
        config,
        source,
      );
      setStarted({
        project: current,
        deploymentId: deployment.id,
        startedAt: new Date().toISOString(),
      });
    } catch (error) {
      toast.error(readableError(error, "The deployment didn't start"));
    } finally {
      setStarting(false);
    }
  }

  return {
    deploy,
    /** Back to the form after a failed build, keeping what was entered. */
    edit: () => setStarted(null),
    project,
    started,
    starting,
  };
}
