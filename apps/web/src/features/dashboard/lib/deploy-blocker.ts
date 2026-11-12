import { VARIABLE_NAME } from "@/features/dashboard/lib/dotenv";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";

/** Why the new-project form can't deploy yet, in plain words; null when it can. */
export function deployBlocker(
  config: DeploymentImportConfig,
  detection: "detecting" | "detected" | "failed",
  repositoryUrl: string,
): string | null {
  if (!repositoryUrl)
    return "This link is missing its repository. Go back and pick one.";
  if (detection === "detecting") return "Reading the repository…";
  if (!config.projectName.trim()) return "Give the project a name.";
  const keys = config.environment.map((row) => row.key.trim()).filter(Boolean);
  if (keys.some((key) => !VARIABLE_NAME.test(key)))
    return "Fix the variable names marked in red.";
  if (new Set(keys).size !== keys.length)
    return "Two variables share a name. Keep one.";
  return null;
}
