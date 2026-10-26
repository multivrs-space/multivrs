/**
 * Keep-warm policy for paid plans. A Pro production deployment renews its
 * activity timeout instead of sleeping, so visitors never hit a cold start.
 * The grant lasts a week past the last keep-warm request: an abandoned app, or
 * one that drops to Hobby, falls back to sleeping and stops costing memory.
 */
const KEEP_WARM_KEY = "keepWarmUntil";
const KEEP_WARM_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;
/** Avoid a storage write on every request; refresh the window hourly. */
const REFRESH_INTERVAL_MS = 60 * 60 * 1_000;

export async function recordKeepWarm(
  storage: DurableObjectStorage,
  keepWarm: boolean,
): Promise<void> {
  const until = (await storage.get<number>(KEEP_WARM_KEY)) ?? 0;
  if (!keepWarm) {
    if (until) await storage.delete(KEEP_WARM_KEY);
    return;
  }
  if (until - Date.now() > KEEP_WARM_WINDOW_MS - REFRESH_INTERVAL_MS) return;
  await storage.put(KEEP_WARM_KEY, Date.now() + KEEP_WARM_WINDOW_MS);
}

export async function keepWarmActive(storage: DurableObjectStorage): Promise<boolean> {
  return ((await storage.get<number>(KEEP_WARM_KEY)) ?? 0) > Date.now();
}
