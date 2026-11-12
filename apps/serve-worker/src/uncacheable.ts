/**
 * Pages that answered `private`, `no-store` or without any shared-cache
 * header. For a while after, their requests skip the stored-copy lookup and
 * the revalidation lock and go straight to the app: two remote round trips
 * saved on every visit to a page that can never be served from cache.
 * Keys include the deployment, so a new deploy checks again.
 */
const REMEMBER_SECONDS = 300;
const MEMORY_LIMIT = 1_000;
const remembered = new Map<string, number>();

function marker(cacheKey: string): Request {
  return new Request(`https://uncacheable.multivrs.internal/${encodeURIComponent(cacheKey)}`);
}

export async function knownUncacheable(cacheKey: string): Promise<boolean> {
  const until = remembered.get(cacheKey);
  if (until && until > Date.now()) return true;
  if (await caches.default.match(marker(cacheKey))) {
    remembered.set(cacheKey, Date.now() + REMEMBER_SECONDS * 1_000);
    return true;
  }
  return false;
}

export function rememberUncacheable(
  cacheKey: string,
  waitUntil: (promise: Promise<unknown>) => void,
): void {
  if (remembered.size >= MEMORY_LIMIT) {
    const oldest = remembered.keys().next().value;
    if (oldest !== undefined) remembered.delete(oldest);
  }
  remembered.set(cacheKey, Date.now() + REMEMBER_SECONDS * 1_000);
  waitUntil(
    caches.default.put(
      marker(cacheKey),
      new Response("1", { headers: { "cache-control": `max-age=${REMEMBER_SECONDS}` } }),
    ),
  );
}
