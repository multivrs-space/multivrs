"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DashCard } from "@/components/dashboard/DashCard";
import { SegmentedControl } from "@/components/dashboard/SegmentedControl";
import {
  LiveGlobe,
  LiveRefresh,
  LiveRocket,
  LiveSquareTerminal,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { ConsoleStream } from "@/features/dashboard/components/logs/ConsoleStream";
import { RequestStream } from "@/features/dashboard/components/logs/RequestStream";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type { LogsData } from "@/features/dashboard/types/request-log.types";

type Stream = "requests" | "console";

/**
 * Logs for what's running: every request the edge served and what the code
 * printed while serving it. Build output lives with each deployment.
 */
export function LogsPage({
  data,
  scopeName,
  baseHref,
  projects,
}: {
  data: LogsData;
  /** The project's name, or the workspace's at `~`. */
  scopeName: string;
  /** `/[username]/[scope]`, for the deployments link. */
  baseHref: string;
  /** Project id → its name and dashboard root, for rows across projects. */
  projects: [string, { name: string; href: string }][];
}) {
  const router = useRouter();
  const [stream, setStream] = useState<Stream>("requests");
  const [refreshing, startRefresh] = useTransition();
  const workspace = baseHref.endsWith("/~");
  return (
    <PageBody wide>
      <DashboardPageHeader
        actions={
          <>
            <Link
              className={buttonVariants({ size: "sm", variant: "quiet" })}
              data-icon-trigger
              href={`${baseHref}/deployments`}
            >
              <LiveRocket strokeWidth={1.75} />
              Build logs
            </Link>
            <Button
              data-icon-trigger
              disabled={refreshing}
              onClick={() => startRefresh(() => router.refresh())}
              size="sm"
              variant="raised"
            >
              <LiveRefresh
                className={refreshing ? "animate-spin" : undefined}
                strokeWidth={1.75}
              />
              Refresh
            </Button>
          </>
        }
        description={
          workspace
            ? "Requests and runtime output across every project in this workspace."
            : "Requests this project served and what its code printed while serving them."
        }
        eyebrow={`${scopeName} · Observe`}
        title="Logs"
      />
      <SegmentedControl
        aria-label="Stream"
        className="w-fit"
        onChange={setStream}
        options={[
          { value: "requests", label: "Requests", icon: LiveGlobe },
          { value: "console", label: "Console", icon: LiveSquareTerminal },
        ]}
        value={stream}
      />
      {stream === "console" ? (
        <ConsoleStream logs={data.console} />
      ) : data.requestState === "ready" ? (
        <RequestStream
          logs={data.requests}
          projects={new Map(projects)}
          workspace={workspace}
        />
      ) : (
        <DashCard className="px-5 py-4 text-[13px] text-muted-foreground">
          {data.requestState === "error"
            ? "The request log couldn't be loaded just now. Try Refresh in a moment."
            : "Edge measurement isn't connected in this environment, so there's no request log here. Console output still shows."}
        </DashCard>
      )}
    </PageBody>
  );
}
