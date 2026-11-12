import type { DashboardDeploymentLog } from "@/lib/services/deployment-detail.types";
import { cn } from "@/lib/utils";

const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Numbered, timestamped log lines; errors tinted so they stand out. */
export function BuildLogLines({
  emptyText,
  lines,
}: {
  emptyText: string;
  lines: { log: DashboardDeploymentLog; line: number }[];
}) {
  if (!lines.length)
    return (
      <p className="px-3 py-10 text-center font-sans text-[13px] text-muted-foreground">
        {emptyText}
      </p>
    );
  return lines.map(({ log, line }) => (
    <div
      className={cn(
        "grid grid-cols-[3rem_4.5rem_minmax(0,1fr)] gap-3 px-3 py-0.5 hover:bg-foreground/[0.03]",
        log.level === "error" &&
          "bg-rose-500/[0.06] text-rose-700 dark:text-rose-300",
      )}
      key={log.id}
    >
      <span className="select-none text-right text-muted-foreground/50">
        {line}
      </span>
      <time className="text-muted-foreground" dateTime={log.createdAt}>
        {TIME.format(new Date(log.createdAt))}
      </time>
      <pre className="whitespace-pre-wrap break-words text-foreground/85">
        {log.message}
      </pre>
    </div>
  ));
}
