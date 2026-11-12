import type { Project } from "@multivrs/client";
import type { DetectionState } from "@/features/dashboard/hooks/useFrameworkDetection";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

/* Sample data for the design lab only. */

const repository = (
  id: number,
  name: string,
  language: string | null,
  isPrivate: boolean,
  updated: string,
): GitHubRepository => ({
  default_branch: "main",
  description: null,
  forks_count: 0,
  full_name: `acme/${name}`,
  html_url: `https://github.com/acme/${name}`,
  id,
  language,
  name,
  owner: { avatar_url: "https://github.com/acme.png", login: "acme" },
  private: isPrivate,
  stargazers_count: 0,
  updated_at: updated,
});

export const LAB_REPOSITORIES = [
  repository(1, "storefront", "TypeScript", true, "2026-10-28T08:00:00Z"),
  repository(2, "api", "TypeScript", true, "2026-10-26T12:00:00Z"),
  repository(3, "docs", "MDX", false, "2026-10-12T09:00:00Z"),
];

export const LAB_DETECTION: DetectionState = {
  status: "detected",
  result: {
    ref: "main",
    framework: "nextjs",
    frameworkName: "Next.js",
    packageManager: "bun",
    buildCommand: "next build",
    outputDirectory: ".next",
  },
};

export const LAB_IMPORT_CONFIG: DeploymentImportConfig = {
  buildCommand: "",
  environment: [
    { id: "a", key: "NEXT_PUBLIC_API_URL", value: "https://api.acme.dev" },
    { id: "b", key: "", value: "" },
  ],
  framework: "nextjs",
  installCommand: "",
  outputDirectory: "",
  projectName: "storefront",
  rootDirectory: ".",
};

export const LAB_SOURCE: RepositorySource = {
  branch: "main",
  name: "storefront",
  owner: "acme",
  team: "acme",
  url: "https://github.com/acme/storefront",
};

export const LAB_PROJECT: Project = {
  id: "lab-project",
  name: "storefront",
  slug: "storefront",
  framework: "nextjs",
  repositoryUrl: "https://github.com/acme/storefront",
  ownerId: "lab",
  organizationId: null,
  productionDeploymentId: null,
  createdAt: "2026-10-28T08:00:00Z",
  updatedAt: "2026-10-28T08:00:00Z",
};

const START = ["Starting build environment", "Build machine ready in 3.2s"];
const INSTALL = [
  "Installing dependencies with bun",
  "Installed dependencies in 2.7s",
];
const BUILD = ["Building with Next.js", "Built in 9.4s"];

export const LAB_BUILD_LINES = [
  {
    label: "Installing",
    status: "building",
    lines: [...START, "Installing dependencies with bun"],
  },
  {
    label: "Failed while building",
    status: "error",
    lines: [...START, ...INSTALL, "Building with Next.js"],
  },
  {
    label: "Ready",
    status: "ready",
    lines: [...START, ...INSTALL, ...BUILD, "Uploaded in 1.1s · ready in 18s"],
  },
];
