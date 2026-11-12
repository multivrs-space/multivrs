import { getServerSession } from "@/lib/auth/session";
import { commitDetails } from "@/lib/services/github-commit.service";

/** The commit behind a deployment: title, author and a link to it on GitHub. */
export async function CommitSource({
  repositoryUrl,
  sha,
}: {
  repositoryUrl: string;
  sha: string;
}) {
  const session = await getServerSession();
  const commit = session
    ? await commitDetails(session.user.id, repositoryUrl, sha)
    : null;
  if (!commit) return <CommitSha repositoryUrl={repositoryUrl} sha={sha} />;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {commit.avatarUrl ? (
        // biome-ignore lint/performance/noImgElement: a 16px avatar from GitHub
        <img
          alt=""
          className="size-4 shrink-0 rounded-full"
          height={16}
          src={commit.avatarUrl}
          width={16}
        />
      ) : null}
      <a
        className="shrink-0 font-geist-mono text-[12px] text-foreground hover:underline"
        href={commit.url}
        rel="noreferrer"
        target="_blank"
      >
        {commit.sha.slice(0, 7)}
      </a>
      <span
        className="min-w-0 truncate text-muted-foreground"
        title={commit.title}
      >
        {commit.title}
        {commit.author ? ` · ${commit.author}` : ""}
      </span>
    </span>
  );
}

/** Just the short SHA, while the details load or when GitHub can't say. */
export function CommitSha({
  repositoryUrl,
  sha,
}: {
  repositoryUrl: string | null;
  sha: string;
}) {
  const short = (
    <span className="font-geist-mono text-[12px]">{sha.slice(0, 7)}</span>
  );
  if (!repositoryUrl) return short;
  return (
    <a
      className="hover:underline"
      href={`${repositoryUrl.replace(/\.git$/, "")}/commit/${sha}`}
      rel="noreferrer"
      target="_blank"
    >
      {short}
    </a>
  );
}
