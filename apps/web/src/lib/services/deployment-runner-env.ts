import type { CreateDeploymentInput } from "@multivrs/client";

/** What the local runner hands the CLI: project env, credentials and build settings. */
export function cliEnvironment(options: {
  apiUrl: string;
  deploymentId: string;
  framework: string | null;
  input: CreateDeploymentInput;
  oidcToken?: string;
  projectEnvironment: Record<string, string>;
  runnerEnv?: Record<string, string>;
  token: string;
}): Record<string, string> {
  const { input } = options;
  return {
    ...options.projectEnvironment,
    ...input.env,
    ...(options.oidcToken ? { MULTIVRS_OIDC_TOKEN: options.oidcToken } : {}),
    MULTIVRS_API_URL: options.apiUrl,
    MULTIVRS_TOKEN: options.token,
    MULTIVRS_DEPLOYMENT_ID: options.deploymentId,
    MULTIVRS_BUN_BINARY:
      process.env.MULTIVRS_BUN_BINARY ??
      (process.versions.bun ? process.execPath : "bun"),
    ...(options.framework ? { MULTIVRS_FRAMEWORK: options.framework } : {}),
    ...(input.buildCommand
      ? { MULTIVRS_BUILD_COMMAND: input.buildCommand }
      : {}),
    ...(input.installCommand
      ? { MULTIVRS_INSTALL_COMMAND: input.installCommand }
      : {}),
    ...(input.outputDirectory
      ? { MULTIVRS_OUTPUT_DIRECTORY: input.outputDirectory }
      : {}),
    ...options.runnerEnv,
    // The runner streams the CLI's output into the log; it needn't post steps too.
    MULTIVRS_LOG_STREAMED: "1",
  };
}
