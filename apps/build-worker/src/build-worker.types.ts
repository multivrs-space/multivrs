import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";

export interface BuildWorkerEnv {
  /** Deployment files and their dashboard screenshots (`previews/`). */
  ARTIFACTS: R2Bucket;
  BUILD_CACHE: R2Bucket;
  BUILD_QUEUE: Queue<BuildJob>;
  BUILD_WORKER_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  /** Its own token with only Browser Rendering: Edit, for deploy screenshots. */
  BROWSER_RENDERING_API_TOKEN?: string;
  DISPATCH_NAMESPACE?: string;
  /** Derives per-deployment origin keys when runtimes run outside a dispatch namespace. */
  RUNTIME_ORIGIN_SECRET?: string;
  Sandbox: DurableObjectNamespace<Sandbox>;
  SANDBOX_TRANSPORT: string;
}

export class BuildCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildCommandError";
  }
}
