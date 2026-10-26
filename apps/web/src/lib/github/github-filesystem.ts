import "server-only";
import type { DetectorFilesystem } from "@multivrs/fs-detectors";
import { z } from "zod";
import { githubFetch } from "@/lib/github/github-client";

const directoryEntrySchema = z.object({ name: z.string(), type: z.string() });
const fileSchema = z.object({ content: z.string(), encoding: z.string() });

interface RepositoryLocation {
  owner: string;
  repo: string;
  ref: string;
  /** Directory inside the repository, without leading or trailing slashes. */
  root: string;
}

/**
 * Detector filesystem over the GitHub contents API. Every framework signal is a
 * root-level file, so one directory listing answers `exists` and only the files
 * detectors actually read (package.json) cost a second request.
 */
export class GitHubFilesystem implements DetectorFilesystem {
  private listing: Promise<Set<string>> | null = null;

  constructor(
    private readonly location: RepositoryLocation,
    private readonly token: string | null,
  ) {}

  private contentsPath(path: string) {
    const { owner, repo, ref, root } = this.location;
    const full = [root, path].filter(Boolean).join("/");
    const encoded = full.split("/").map(encodeURIComponent).join("/");
    return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encoded}?ref=${encodeURIComponent(ref)}`;
  }

  private names(): Promise<Set<string>> {
    this.listing ??= githubFetch(this.contentsPath(""), this.token).then(
      async (response) => {
        if (!response.ok) {
          throw new Error(
            `GitHub returned ${response.status} listing the repository`,
          );
        }
        const entries = directoryEntrySchema
          .array()
          .parse(await response.json());
        return new Set(entries.map((entry) => entry.name));
      },
    );
    return this.listing;
  }

  async exists(path: string): Promise<boolean> {
    if (path.includes("/")) return false;
    return (await this.names()).has(path);
  }

  async readFile(path: string): Promise<string> {
    const response = await githubFetch(this.contentsPath(path), this.token);
    if (!response.ok) throw new Error(`Could not read ${path}`);
    const file = fileSchema.parse(await response.json());
    if (file.encoding !== "base64")
      throw new Error(`Unexpected encoding for ${path}`);
    return Buffer.from(file.content, "base64").toString("utf8");
  }
}
