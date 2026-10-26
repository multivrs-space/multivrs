import type { ControlResolution } from "./control";

/**
 * Short-lived cache for control-plane resolutions. Without it every customer
 * request waits on a round trip to the dashboard plus several database queries.
 * The TTLs bound staleness: a promotion, rollback, firewall edit or billing
 * block reaches every data centre within EDGE_TTL_SECONDS.
 */
const EDGE_TTL_SECONDS = 30;
/** Unknown hostnames (bots probing subdomains) are remembered briefly. */
const MISS_TTL_SECONDS = 10;
/** Per-isolate copy so hot sites skip even the Cache API lookup. */
const MEMORY_TTL_MS = 5_000;
const MEMORY_LIMIT = 500;
/** Bump when ControlResolution changes shape so old entries are ignored. */
const CACHE_VERSION = "v1";

export class ResolutionNotFoundError extends Error {
  constructor() {
    super("Deployment not found");
    this.name = "ResolutionNotFoundError";
  }
}

type Cached = ControlResolution | null;
const memory = new Map<string, { expires: number; value: Promise<Cached> }>();

function cacheRequest(key: string): Request {
  return new Request(
    `https://resolve.multivrs.internal/${CACHE_VERSION}/${encodeURIComponent(key)}`,
  );
}

function remember(key: string, value: Promise<Cached>, ttlMs: number): void {
  if (memory.size >= MEMORY_LIMIT) {
    const oldest = memory.keys().next().value;
    if (oldest !== undefined) memory.delete(oldest);
  }
  memory.set(key, { expires: Date.now() + ttlMs, value });
}

async function readThrough(
  key: string,
  load: () => Promise<Response>,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<Cached> {
  const cache = caches.default;
  const hit = await cache.match(cacheRequest(key));
  if (hit) return hit.json<Cached>();
  const response = await load();
  if (response.status === 404) {
    const miss = Response.json(null, {
      headers: { "cache-control": `max-age=${MISS_TTL_SECONDS}` },
    });
    waitUntil?.(cache.put(cacheRequest(key), miss));
    return null;
  }
  if (!response.ok) {
    throw new Error(`control plane returned ${response.status}`);
  }
  const resolution = await response.json<ControlResolution>();
  const stored = Response.json(resolution, {
    headers: { "cache-control": `max-age=${EDGE_TTL_SECONDS}` },
  });
  waitUntil?.(cache.put(cacheRequest(key), stored));
  return resolution;
}

/**
 * Resolve through the isolate memory, then the edge cache, then the control
 * plane. Concurrent requests for one key share a single lookup; failures are
 * never cached so the next request retries.
 */
export async function cachedResolution(
  key: string,
  load: () => Promise<Response>,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<ControlResolution> {
  const entry = memory.get(key);
  let pending = entry && entry.expires > Date.now() ? entry.value : undefined;
  if (!pending) {
    pending = readThrough(key, load, waitUntil);
    remember(key, pending, MEMORY_TTL_MS);
    pending.catch(() => memory.delete(key));
  }
  const resolution = await pending;
  if (!resolution) throw new ResolutionNotFoundError();
  return resolution;
}
