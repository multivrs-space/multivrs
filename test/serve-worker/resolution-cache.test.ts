import { beforeEach, describe, expect, test } from "bun:test";
import {
  cachedResolution,
  ResolutionNotFoundError,
} from "../../apps/serve-worker/src/resolution-cache";

/** Minimal Cache API stand-in: stores bodies by URL, ignores TTLs. */
const store = new Map<string, string>();
const fakeCache = {
  async match(request: Request) {
    const body = store.get(request.url);
    return body === undefined ? undefined : new Response(body);
  },
  async put(request: Request, response: Response) {
    store.set(request.url, await response.text());
  },
};
Object.assign(globalThis, { caches: { default: fakeCache } });

const resolution = { deploymentId: "dep_1", projectId: "proj_1" };
let key = 0;
const nextKey = () => `host:test-${++key}.multivrs.app`;

function counter(response: () => Response) {
  const loader = async () => {
    loader.calls += 1;
    return response();
  };
  loader.calls = 0;
  return loader;
}

async function flush(pending: Promise<unknown>[]) {
  await Promise.all(pending);
}

describe("deployment resolution cache", () => {
  beforeEach(() => store.clear());

  test("shares one lookup between concurrent requests", async () => {
    const load = counter(() => Response.json(resolution));
    const cacheKey = nextKey();
    const [a, b] = await Promise.all([
      cachedResolution(cacheKey, load),
      cachedResolution(cacheKey, load),
    ]);
    expect(a).toEqual(b);
    expect(load.calls).toBe(1);
  });

  test("serves later requests from the edge cache", async () => {
    const load = counter(() => Response.json(resolution));
    const cacheKey = nextKey();
    const writes: Promise<unknown>[] = [];
    await cachedResolution(cacheKey, load, (p) => writes.push(p));
    await flush(writes);
    expect(store.size).toBe(1);
  });

  test("remembers unknown hostnames as not found", async () => {
    const load = counter(() => new Response("missing", { status: 404 }));
    const cacheKey = nextKey();
    const writes: Promise<unknown>[] = [];
    await expect(cachedResolution(cacheKey, load, (p) => writes.push(p))).rejects.toBeInstanceOf(
      ResolutionNotFoundError,
    );
    await flush(writes);
    expect(store.size).toBe(1);
  });

  test("never caches control-plane failures", async () => {
    let failing = true;
    const load = counter(() =>
      failing ? new Response("boom", { status: 500 }) : Response.json(resolution),
    );
    const cacheKey = nextKey();
    await expect(cachedResolution(cacheKey, load)).rejects.toThrow("500");
    expect(store.size).toBe(0);
    failing = false;
    expect(await cachedResolution(cacheKey, load)).toEqual(resolution as never);
    expect(load.calls).toBe(2);
  });
});
