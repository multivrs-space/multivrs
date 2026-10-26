import { cachedResolution } from "./resolution-cache";
import type { Env } from "./types";

export interface ControlResolution {
  /** Production deployment on a paid plan: its container never sleeps. */
  alwaysOn?: boolean;
  analyticsEnabled: boolean;
  attackMode: boolean;
  browserTtl: number;
  cacheMode: "aggressive" | "bypass" | "smart";
  deploymentId: string;
  artifactHash: string;
  firewallRules: Array<{
    action: "allow" | "deny" | "challenge" | "rate_limit";
    conditions: Array<{
      key?: string;
      op: "eq" | "neq" | "contains" | "starts_with" | "regex" | "in";
      type: "ip" | "path" | "method" | "country" | "user_agent" | "header";
      value: string | string[];
    }>;
    enabled?: boolean;
    id: string;
  }>;
  projectId: string;
  runtimeEnvironment: Record<string, string>;
  edgeTtl: number;
  speedInsightsEnabled: boolean;
  cacheVersion: string;
  defaultRevalidate: number;
  runtimeConfigVersion: string;
  staleWindow: number;
  billingBlocked: boolean;
  billingBlockReason: string | null;
}

export function encodeRuntimeEnvironment(values: Record<string, string>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(values));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function resolveRequest(env: Env, query: Record<string, string>): Promise<Response> {
  const endpoint = new URL("/api/serve/resolve", env.CONTROL_PLANE_URL);
  for (const [name, value] of Object.entries(query)) endpoint.searchParams.set(name, value);
  const headers = new Headers();
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  return fetch(endpoint, { headers });
}

export function resolveDeployment(
  request: Request,
  env: Env,
  context?: ExecutionContext,
): Promise<ControlResolution> {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return cachedResolution(
    `host:${hostname}`,
    () => resolveRequest(env, { hostname }),
    context ? (promise) => context.waitUntil(promise) : undefined,
  );
}

export function resolveProjectDeployment(
  projectId: string,
  env: Env,
  context?: ExecutionContext,
): Promise<ControlResolution> {
  return cachedResolution(
    `project:${projectId}`,
    () => resolveRequest(env, { projectId }),
    context ? (promise) => context.waitUntil(promise) : undefined,
  );
}
