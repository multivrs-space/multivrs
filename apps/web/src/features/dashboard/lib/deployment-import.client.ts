import {
  deploymentLogSchema,
  deploymentSchema,
  type Project,
  projectSchema,
} from "@multivrs/client";
import { z } from "zod";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

const errorSchema = z.object({ error: z.object({ message: z.string() }) });
const logsSchema = z.array(deploymentLogSchema);

async function failure(response: Response, fallback: string) {
  const parsed = errorSchema.safeParse(await response.json().catch(() => null));
  return new Error(parsed.success ? parsed.data.error.message : fallback);
}

export async function createImportProject(
  config: DeploymentImportConfig,
  source: RepositorySource,
) {
  const response = await fetch("/api/projects", {
    body: JSON.stringify({
      account: source.team === "dashboard" ? undefined : source.team,
      framework: config.framework,
      name: config.projectName.trim(),
      repositoryUrl: source.url,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw await failure(response, "Project creation failed");
  return projectSchema.parse(await response.json());
}

export async function queueImportDeployment(
  projectId: string,
  config: DeploymentImportConfig,
  source: RepositorySource,
) {
  const response = await fetch(`/api/projects/${projectId}/deployments`, {
    body: JSON.stringify({
      branch: source.branch,
      buildCommand: config.buildCommand.trim() || undefined,
      installCommand: config.installCommand.trim() || undefined,
      outputDirectory: config.outputDirectory.trim() || undefined,
      repoUrl: source.url,
      rootDirectory: config.rootDirectory.trim() || ".",
      target: "production",
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw await failure(response, "Deployment could not be queued");
  return deploymentSchema.parse(await response.json());
}

/** A project created by an earlier attempt keeps its name; the framework follows the form. */
export async function updateImportProject(
  project: Project,
  config: DeploymentImportConfig,
) {
  if (project.framework === config.framework) return project;
  const response = await fetch(`/api/projects/${project.id}`, {
    body: JSON.stringify({ framework: config.framework, name: project.name }),
    headers: { "content-type": "application/json" },
    method: "PATCH",
  });
  if (!response.ok) throw await failure(response, "Project update failed");
  return projectSchema.parse(await response.json());
}

/**
 * Variables from the form become the project's own (encrypted, for every
 * environment), so later builds and redeploys get them too.
 */
export async function saveImportEnvironment(
  projectId: string,
  environment: DeploymentImportConfig["environment"],
) {
  for (const item of environment) {
    const key = item.key.trim();
    if (!key) continue;
    const response = await fetch(`/api/projects/${projectId}/environment`, {
      body: JSON.stringify({
        key,
        targets: ["production", "preview", "development"],
        value: item.value,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw await failure(response, `${key} couldn't be saved`);
  }
}

export async function getImportProgress(
  projectId: string,
  deploymentId: string,
) {
  const [statusResponse, logsResponse] = await Promise.all([
    fetch(`/api/projects/${projectId}/deployments/${deploymentId}`),
    fetch(`/api/projects/${projectId}/deployments/${deploymentId}/logs`),
  ]);
  if (!statusResponse.ok) throw new Error("Deployment status is unavailable");
  return {
    deployment: deploymentSchema.parse(await statusResponse.json()),
    logs: logsResponse.ok ? logsSchema.parse(await logsResponse.json()) : [],
  };
}
