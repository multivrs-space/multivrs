import { getFramework } from "@multivrs/frameworks";
import { detectProject } from "@multivrs/fs-detectors";
import { unstable_rethrow } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { githubAccessToken, githubFetch } from "@/lib/github/github-client";
import { GitHubFilesystem } from "@/lib/github/github-filesystem";
import {
  type FrameworkDetection,
  frameworkDetectionQuerySchema,
} from "@/lib/schemas/github.schemas";
import { logError } from "@/lib/services/logger.service";

/** Detect a repository's framework and package manager straight from GitHub. */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parsed = frameworkDetectionQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid repository" },
        { status: 400 },
      );
    }
    const token = await githubAccessToken(req.headers);
    const { owner, repo } = parsed.data;
    const ref = parsed.data.ref || (await defaultBranch(owner, repo, token));
    if (!ref) {
      return NextResponse.json(
        { error: "Repository not found, or Multivrs can't access it" },
        { status: 404 },
      );
    }
    const result = await detectProject(
      new GitHubFilesystem({ ...parsed.data, ref }, token),
    );
    const framework = result.frameworkId
      ? getFramework(result.frameworkId)
      : undefined;
    const body: FrameworkDetection = {
      ref,
      framework: result.frameworkId,
      frameworkName: framework?.name ?? null,
      packageManager: result.packageManager,
      buildCommand: framework?.build.buildCommand ?? null,
      outputDirectory: framework?.build.outputDirectory ?? null,
    };
    return NextResponse.json(body);
  } catch (err: unknown) {
    unstable_rethrow(err);
    logError("github.framework_detection.failed", err);
    return NextResponse.json(
      { error: "Could not read the repository to detect its framework" },
      { status: 502 },
    );
  }
}

const repositorySchema = z.object({ default_branch: z.string().min(1) });

async function defaultBranch(
  owner: string,
  repo: string,
  token: string | null,
): Promise<string | null> {
  const response = await githubFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    token,
  );
  if (!response.ok) return null;
  return repositorySchema.parse(await response.json()).default_branch;
}
