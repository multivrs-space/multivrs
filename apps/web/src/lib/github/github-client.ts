import "server-only";
import { auth } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

/** The signed-in user's GitHub OAuth token, or null when GitHub isn't linked. */
export async function githubAccessToken(
  headers: Headers,
): Promise<string | null> {
  try {
    const credentials = await auth.api.getAccessToken({
      body: { providerId: "github" },
      headers,
    });
    return credentials.accessToken ?? null;
  } catch {
    return null;
  }
}

/** GET a GitHub REST path. A null token makes an unauthenticated request. */
export function githubFetch(path: string, token: string | null) {
  return fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "Multivrs-App",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
}
