import { LogsPage } from "@/features/dashboard/components/LogsPage";
import { observeScope } from "@/features/dashboard/components/observe/observe-scope";
import { listRequestLogs } from "@/lib/services/request-log.service";
import { listRuntimeLogs } from "@/lib/services/runtime-log.service";

/** Logs for one project, or for every project at the `~` scope. */
export async function LogsSection({
  username,
  scope,
}: {
  username: string;
  scope: string;
}) {
  const context = await observeScope(username, scope);
  const [requests, runtime] = await Promise.all([
    listRequestLogs(context.ids).catch(() => undefined),
    listRuntimeLogs(context.ids),
  ]);
  return (
    <LogsPage
      baseHref={context.baseHref}
      data={{
        requests: requests ?? [],
        requestState:
          requests === undefined
            ? "error"
            : requests === null
              ? "unconfigured"
              : "ready",
        console: runtime,
      }}
      projects={context.links}
      scopeName={context.scopeName}
    />
  );
}
