import type { ArtifactManifest, Env } from "./types";

/**
 * Deployment manifests by artifact hash. A manifest never changes for its
 * hash, so it is kept in isolate memory and the edge cache indefinitely
 * instead of being read from storage on every request.
 */
const manifests = new Map<string, Promise<ArtifactManifest | null>>();
const MEMORY_LIMIT = 200;

async function readManifest(
  env: Env,
  context: ExecutionContext,
  artifactHash: string,
): Promise<ArtifactManifest | null> {
  const cacheKey = new Request(`https://manifest.multivrs.internal/${artifactHash}`);
  const hit = await caches.default.match(cacheKey);
  if (hit) return hit.json<ArtifactManifest>();
  const object = await env.ARTIFACTS.get(`artifacts/${artifactHash}/manifest.json`);
  if (!object) return null;
  const manifest = await object.json<ArtifactManifest>();
  context.waitUntil(
    caches.default.put(
      cacheKey,
      Response.json(manifest, {
        headers: { "cache-control": "max-age=31536000, immutable" },
      }),
    ),
  );
  return manifest;
}

export function loadManifest(
  env: Env,
  context: ExecutionContext,
  artifactHash: string,
): Promise<ArtifactManifest | null> {
  const known = manifests.get(artifactHash);
  if (known) return known;
  if (manifests.size >= MEMORY_LIMIT) {
    const oldest = manifests.keys().next().value;
    if (oldest !== undefined) manifests.delete(oldest);
  }
  const pending = readManifest(env, context, artifactHash);
  manifests.set(artifactHash, pending);
  // Never remember a miss or a failure: the next request tries again.
  pending
    .then((manifest) => {
      if (!manifest) manifests.delete(artifactHash);
    })
    .catch(() => manifests.delete(artifactHash));
  return pending;
}
