import { getSandbox, type Sandbox } from "@cloudflare/sandbox";
import type { BuildWorkerEnv } from "./build-worker.types";

/** How long a warm machine waits for the next build before it sleeps. */
const WARM_FOR = "15m";
/** A lease older than the longest build belongs to a build that crashed. */
const STALE_MINUTES = 50;
const LOCK = "/tmp/multivrs-lease";
/** Written after a machine's first build; its package cache is warm from then on. */
const USED = "/tmp/multivrs-used";

export interface SandboxLease {
  sandbox: Sandbox;
  /** The account's own machine (claimed), rather than a one-off fresh one. */
  warm: boolean;
  /** It has built before since it booted, so dependencies are cached. */
  reused: boolean;
  /** This build's own folder; removed when the lease ends. */
  root: string;
  release(): Promise<void>;
}

/**
 * A machine for one build. The warm one is claimed with an atomic lock, so
 * only one build uses it at a time; if it's busy, the build gets a fresh
 * machine of its own, exactly as before. `buildId` must be shell-safe (the
 * job schema restricts deployment ids to [a-z0-9-_]).
 */
export async function leaseSandbox(
  env: BuildWorkerEnv,
  ids: { warm: string; fresh: string; build: string },
): Promise<SandboxLease> {
  const root = `/workspace/builds/${ids.build}`;
  const warm = getSandbox(env.Sandbox, ids.warm, { sleepAfter: WARM_FOR });
  const claim = await warm
    .exec(
      `{ mkdir ${LOCK} 2>/dev/null || { [ -n "$(find ${LOCK} -maxdepth 0 -mmin +${STALE_MINUTES})" ] && rm -rf ${LOCK} && mkdir ${LOCK}; }; } && { [ -f ${USED} ] && echo reused || { touch ${USED}; echo fresh; }; }`,
    )
    .catch(() => null);
  if (claim?.success) {
    return {
      sandbox: warm,
      warm: true,
      reused: claim.stdout.trim() === "reused",
      root,
      // Wipe this build's files, keep the machine (and its package cache) warm.
      release: async () => {
        await warm
          .exec(`rm -rf ${root} /tmp/multivrs-${ids.build}-*; rm -rf ${LOCK}`)
          .catch(() => undefined);
      },
    };
  }
  const fresh = getSandbox(env.Sandbox, ids.fresh, { sleepAfter: "10m" });
  return {
    sandbox: fresh,
    warm: false,
    reused: false,
    root,
    release: async () => {
      await fresh.destroy().catch(() => undefined);
    },
  };
}

/**
 * Boot an account's machine ahead of its build (the user opened a deploy
 * screen), so the build itself starts on a running machine.
 */
export async function wakeSandbox(env: BuildWorkerEnv, warmId: string) {
  const sandbox = getSandbox(env.Sandbox, warmId, { sleepAfter: WARM_FOR });
  await sandbox.exec("true").catch(() => undefined);
}
