import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const commitSchema = z.object({
  sha: z.string(),
  html_url: z.url(),
  commit: z.object({
    message: z.string(),
    author: z.object({ name: z.string() }).nullable(),
  }),
  author: z.object({ login: z.string(), avatar_url: z.url() }).nullable(),
});

export interface CommitDetails {
  sha: string;
  /** First line only, as a commit list shows it. */
  title: string;
  author: string | null;
  avatarUrl: string | null;
  url: string;
}

const REPOSITORY = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/;

/**
 * A commit's title and author from GitHub, read with the viewer's own GitHub
 * connection (so private repositories work). Null when it can't be read; the
 * page then shows the short SHA alone.
 */
export async function commitDetails(
  userId: string,
  repositoryUrl: string,
  sha: string,
): Promise<CommitDetails | null> {
  const match = REPOSITORY.exec(repositoryUrl);
  if (!match || !/^[0-9a-f]{7,40}$/.test(sha)) return null;
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "github" },
    select: { accessToken: true },
  });
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "multivrs-dashboard",
  };
  if (account?.accessToken)
    headers.authorization = `Bearer ${account.accessToken}`;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${match[1]}/${match[2]}/commits/${sha}`,
      { headers, signal: AbortSignal.timeout(4_000) },
    );
    if (!response.ok) return null;
    const body = commitSchema.parse(await response.json());
    return {
      sha: body.sha,
      title: body.commit.message.split("\n")[0]?.trim() ?? "",
      author: body.author?.login ?? body.commit.author?.name ?? null,
      avatarUrl: body.author?.avatar_url ?? null,
      url: body.html_url,
    };
  } catch {
    return null;
  }
}
