import { FRAMEWORK_IDS } from "@multivrs/config";
import { z } from "zod";

export const githubRepositorySchema = z.object({
  default_branch: z.string().min(1),
  description: z.string().nullable(),
  forks_count: z.number().int().nonnegative().default(0),
  full_name: z.string().min(1),
  html_url: z.url(),
  id: z.number().int(),
  language: z.string().nullable(),
  name: z.string().min(1),
  owner: z.object({ avatar_url: z.url(), login: z.string().min(1) }),
  private: z.boolean(),
  stargazers_count: z.number().int().nonnegative(),
  updated_at: z.string(),
});

export const githubRepositoriesResponseSchema = z.object({
  connected: z.boolean(),
  owner: z.string().nullable(),
  repos: z.array(githubRepositorySchema),
});

export const githubRepositoryUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    url.hostname === "github.com" &&
    url.pathname.split("/").filter(Boolean).length >= 2
  );
}, "Enter an HTTPS GitHub repository URL");

export type GitHubRepository = z.infer<typeof githubRepositorySchema>;

export const frameworkDetectionQuerySchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  /** Branch to read; omitted means the repository's default branch. */
  ref: z.string().max(255).optional(),
  root: z
    .string()
    .max(500)
    .default(".")
    .transform((value) =>
      value
        .split("/")
        .filter((segment) => segment && segment !== ".")
        .join("/"),
    )
    .refine(
      (value) => !value.split("/").includes(".."),
      "Root directory must stay inside the repository",
    ),
});

export const frameworkDetectionSchema = z.object({
  /** The branch that was read (resolves the default branch when none was given). */
  ref: z.string(),
  framework: z.enum(FRAMEWORK_IDS).nullable(),
  frameworkName: z.string().nullable(),
  packageManager: z.enum(["bun", "pnpm", "yarn", "npm"]),
  buildCommand: z.string().nullable(),
  outputDirectory: z.string().nullable(),
});

export type FrameworkDetection = z.infer<typeof frameworkDetectionSchema>;
