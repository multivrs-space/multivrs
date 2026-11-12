import { type RuntimeProjectConfig, runtimeProjectConfigSchema } from "@multivrs/routing-utils";
import type { ControlResolution } from "./control";
import type { Env } from "./types";

/** Config is fixed per version, so each isolate keeps the ones it has used. */
const remembered = new Map<string, RuntimeProjectConfig>();
const MEMORY_LIMIT = 200;

function rememberConfig(configKey: string, config: RuntimeProjectConfig) {
  if (remembered.size >= MEMORY_LIMIT) {
    const oldest = remembered.keys().next().value;
    if (oldest !== undefined) remembered.delete(oldest);
  }
  remembered.set(configKey, config);
  return config;
}

function key(projectId: string, version: string): string {
  return `project-config:${projectId}:${version}`;
}

function controlHeaders(env: Env): Headers {
  const headers = new Headers();
  if (env.CONTROL_PLANE_TOKEN) headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  return headers;
}

export async function loadRuntimeConfig(
  env: Env,
  context: ExecutionContext,
  deployment: ControlResolution,
): Promise<RuntimeProjectConfig> {
  const configKey = key(deployment.projectId, deployment.runtimeConfigVersion);
  const known = remembered.get(configKey);
  if (known) return known;
  const fromKv = await env.RUNTIME_CONFIG?.get(configKey, "json");
  const kvResult = runtimeProjectConfigSchema.safeParse(fromKv);
  if (kvResult.success) return rememberConfig(configKey, kvResult.data);

  const cacheKey = new Request(`https://runtime-config.multivrs.internal/${configKey}`);
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const parsed = runtimeProjectConfigSchema.safeParse(await cached.json());
    if (parsed.success) return rememberConfig(configKey, parsed.data);
  }

  const endpoint = new URL("/api/serve/config", env.CONTROL_PLANE_URL);
  endpoint.searchParams.set("projectId", deployment.projectId);
  endpoint.searchParams.set("version", deployment.runtimeConfigVersion);
  const response = await fetch(endpoint, { headers: controlHeaders(env) });
  if (!response.ok) throw new Error(`runtime config returned ${response.status}`);
  const parsed = runtimeProjectConfigSchema.parse(await response.json());
  context.waitUntil(
    caches.default.put(
      cacheKey,
      Response.json(parsed, { headers: { "cache-control": "public, max-age=60" } }),
    ),
  );
  if (env.RUNTIME_CONFIG && parsed.version === deployment.runtimeConfigVersion) {
    context.waitUntil(env.RUNTIME_CONFIG.put(configKey, JSON.stringify(parsed)));
  }
  // Only an answer for exactly this version is safe to keep for good.
  return parsed.version === deployment.runtimeConfigVersion
    ? rememberConfig(configKey, parsed)
    : parsed;
}
