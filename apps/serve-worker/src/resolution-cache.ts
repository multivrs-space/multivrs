import type { ControlResolution } from "./control";

/**
 * Cache for control-plane resolutions. Without it every customer request
 * waits on a round trip to the dashboard plus several database queries.
 *
 * Entries are fresh for FRESH_SECONDS. After that they are still served,
 * instantly, for up to STALE_SECONDS while one background request refreshes
 * them, so a quiet site never makes a visitor wait on the dashboard. A
 * promotion, rollback, firewall edit or billing block therefore reaches a
 * data centre on its next request after FRESH_SECONDS; only an entry older
 * than STALE_SECONDS blocks on the control plane.
 */
const FRESH_SECONDS = 30;
const STALE_SECONDS = 60 * 60;
/** Unknown hostnames (bots probing subdomains) are remembered briefly. */
const MISS_TTL_SECONDS = 10;
/** Per-isolate copy so hot sites skip even the Cache API lookup. */
const MEMORY_TTL_MS = 5_000;
const MEMORY_LIMIT = 500;
/** Bump when the stored shape changes so old entries are ignored. */
const CACHE_VERSION = "v2";

export class ResolutionNotFoundError extends Error {
  constructor() {
    super("Deployment not found");
    this.name = "ResolutionNotFoundError";
  }
}

type Cached = ControlResolution | null;
interface Stored {
  value: Cached;
  /** Epoch ms after which the entry is served stale and refreshed. */
  freshUntil: number;
}

const memory = new Map<string, { expires: number; value: Promise<Cached> }>();
/** Keys with a background refresh in flight, so one stale burst makes one call. */
const refreshing = new Set<string>();

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

/** Ask the control plane, store the answer, and return it. */
async function fetchAndStore(
  key: string,
  load: () => Promise<Response>,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<Cached> {
  const response = await load();
  if (response.status !== 404 && !response.ok) {
    throw new Error(`control plane returned ${response.status}`);
  }
  const value = response.status === 404 ? null : await response.json<ControlResolution>();
  const stored: Stored = {
    value,
    freshUntil: Date.now() + (value ? FRESH_SECONDS : MISS_TTL_SECONDS) * 1_000,
  };
  const maxAge = value ? STALE_SECONDS : MISS_TTL_SECONDS;
  const put = caches.default.put(
    cacheRequest(key),
    Response.json(stored, { headers: { "cache-control": `max-age=${maxAge}` } }),
  );
  if (waitUntil) waitUntil(put);
  else await put;
  return value;
}

async function readThrough(
  key: string,
  load: () => Promise<Response>,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<Cached> {
  const hit = await caches.default.match(cacheRequest(key));
  const stored = hit ? await hit.json<Stored>().catch(() => null) : null;
  if (!stored || !("freshUntil" in stored)) return fetchAndStore(key, load, waitUntil);
  if (Date.now() >= stored.freshUntil && stored.value && !refreshing.has(key)) {
    // Stale but usable: answer now, refresh behind the response.
    refreshing.add(key);
    const refresh = fetchAndStore(key, load)
      .catch(() => undefined)
      .finally(() => refreshing.delete(key));
    waitUntil?.(refresh);
  }
  return stored.value;
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
