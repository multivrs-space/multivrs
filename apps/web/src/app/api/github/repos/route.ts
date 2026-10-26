import { unstable_rethrow } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { githubAccessToken, githubFetch } from "@/lib/github/github-client";
import { githubRepositorySchema } from "@/lib/schemas/github.schemas";
import { logError } from "@/lib/services/logger.service";

const PAGE_SIZE = 100;
const MAX_PAGES = 3;
const githubUserSchema = z.object({ login: z.string().min(1) });

/** Repositories the signed-in user can import, newest activity first. */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = await githubAccessToken(req.headers);
    if (!token) {
      return NextResponse.json({ connected: false, owner: null, repos: [] });
    }
    const userResponse = await githubFetch("/user", token);
    if (!userResponse.ok) {
      return NextResponse.json({ connected: false, owner: null, repos: [] });
    }
    const { login } = githubUserSchema.parse(await userResponse.json());

    const repos = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await githubFetch(
        `/user/repos?sort=updated&per_page=${PAGE_SIZE}&page=${page}`,
        token,
      );
      if (!response.ok) break;
      const batch = githubRepositorySchema.array().parse(await response.json());
      repos.push(...batch);
      if (batch.length < PAGE_SIZE) break;
    }
    return NextResponse.json({ connected: true, owner: login, repos });
  } catch (err: unknown) {
    unstable_rethrow(err);
    logError("github.repositories.fetch_failed", err);
    return NextResponse.json(
      { error: "GitHub repositories could not be loaded" },
      { status: 500 },
    );
  }
}
