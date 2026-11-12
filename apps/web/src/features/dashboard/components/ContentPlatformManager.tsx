"use client";

import { useState } from "react";
import { BlobSection } from "@/features/dashboard/components/content-platform/BlobSection";
import { CacheSection } from "@/features/dashboard/components/content-platform/CacheSection";
import { runContentAction } from "@/features/dashboard/components/content-platform/content-actions";
import { EdgeConfigSection } from "@/features/dashboard/components/content-platform/EdgeConfigSection";
import { MicrofrontendSection } from "@/features/dashboard/components/content-platform/MicrofrontendSection";
import { RedirectSection } from "@/features/dashboard/components/content-platform/RedirectSection";
import type { ContentPlatformData } from "@/features/dashboard/types/content-platform.types";

/**
 * Storage, routing and regeneration for one project. Each section writes
 * durable config and publishes a versioned edge snapshot.
 */
export function ContentPlatformManager({
  initialData,
  projectId,
}: {
  initialData: ContentPlatformData;
  projectId: string;
}) {
  const [data, setData] = useState(initialData);
  const [busy, setBusy] = useState<string | null>(null);

  async function run<T>(
    key: string,
    task: () => Promise<T>,
    done: (value: T) => void,
  ) {
    return runContentAction({ done, key, setBusy, task });
  }

  return (
    <div className="space-y-3">
      <div className="px-1 pt-4">
        <p className="font-geist-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Content platform
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em]">
          Storage, routing and regeneration
        </h2>
      </div>
      <CacheSection
        busy={busy}
        data={data}
        projectId={projectId}
        run={run}
        setData={setData}
      />
      <div className="grid gap-3 xl:grid-cols-2">
        <BlobSection
          blobs={data.blobs}
          busy={busy}
          projectId={projectId}
          run={run}
          setData={setData}
        />
        <RedirectSection
          busy={busy}
          projectId={projectId}
          redirects={data.redirects}
          run={run}
          setData={setData}
        />
        <EdgeConfigSection
          busy={busy}
          entries={data.edgeConfig}
          projectId={projectId}
          run={run}
          setData={setData}
        />
        <MicrofrontendSection
          busy={busy}
          data={data}
          projectId={projectId}
          run={run}
          setData={setData}
        />
      </div>
    </div>
  );
}
