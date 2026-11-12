import "server-only";
import type { CreateDeploymentInput, Deployment } from "@multivrs/client";
import { ConflictError } from "@multivrs/error-utils";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { runBackgroundDeployment } from "@/lib/services/build-runner";
import {
  cloudBuildConfigured,
  dispatchCloudBuild,
} from "@/lib/services/cloud-build-dispatch.service";
import {
  createDeployment,
  getDeployment,
} from "@/lib/services/deployment.service";
import { getProject } from "@/lib/services/project.service";

/**
 * Create a deployment and, when it builds from a repository, hand it to the
 * build service (or the local runner in development).
 */
export async function startDeployment(
  userId: string,
  projectId: string,
  input: CreateDeploymentInput,
  apiUrl: string,
): Promise<Deployment> {
  const deployment = await createDeployment(userId, projectId, input);
  if (!input.repoUrl) return deployment;
  if (cloudBuildConfigured()) {
    await dispatchCloudBuild({
      apiUrl,
      deploymentId: deployment.id,
      input,
      projectId,
      userId,
    });
  } else if (process.env.NODE_ENV !== "production") {
    after(() =>
      runBackgroundDeployment(userId, projectId, deployment.id, {
        apiUrl,
        input,
      }),
    );
  } else {
    const message = "Builds aren't set up in this environment yet.";
    await Promise.all([
      prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: "error",
          errorMessage: message,
          finishedAt: new Date(),
        },
      }),
      prisma.deploymentLog.create({
        data: { deploymentId: deployment.id, level: "error", message },
      }),
    ]);
    throw new Error(message);
  }
  return deployment;
}

/**
 * Build a deployment's branch again, to the same target, from the project's
 * repository. Settings typed at import aren't stored, so detection reruns.
 */
export async function redeploy(
  userId: string,
  projectId: string,
  deploymentId: string,
  apiUrl: string,
): Promise<Deployment> {
  const [source, project] = await Promise.all([
    getDeployment(userId, projectId, deploymentId),
    getProject(userId, projectId, "deploy"),
  ]);
  if (!project.repositoryUrl) {
    throw new ConflictError(
      "This project isn't connected to a repository, so there's nothing to rebuild from.",
    );
  }
  return startDeployment(
    userId,
    projectId,
    {
      branch: source.branch ?? undefined,
      target: source.target,
      repoUrl: project.repositoryUrl,
    },
    apiUrl,
  );
}
