import type { GitHubRepository } from "@/lib/schemas/github.schemas";

export function githubImportHref(
  repository: GitHubRepository,
  workspace: string,
): string {
  const query = new URLSearchParams({
    name: repository.name,
    owner: repository.owner.login,
    provider: "github",
    s: repository.html_url,
  });
  // URL imports don't know the default branch; detection resolves it.
  if (repository.default_branch) query.set("branch", repository.default_branch);
  return `/${workspace}/new/import?${query.toString()}`;
}
