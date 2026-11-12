"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LiveRefresh } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  CacheSettingsCard,
  CdnTelemetryCard,
} from "@/features/dashboard/components/CdnSettingsControls";
import { ContentPlatformManager } from "@/features/dashboard/components/ContentPlatformManager";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import type { ContentPlatformData } from "@/features/dashboard/types/content-platform.types";
import type { EdgeSettingsData } from "@/features/dashboard/types/edge-settings.types";
import { requestOk } from "@/lib/api/request.client";

/** Cache policy, telemetry and the content platform for one project. */
export function CdnPage({
  projectId,
  projectName,
  initialSettings,
  initialContent,
}: {
  projectId: string;
  projectName: string;
  initialSettings: EdgeSettingsData;
  initialContent: ContentPlatformData;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [working, setWorking] = useState<"saving" | "purging" | null>(null);

  function request(path: string, method: "PATCH" | "POST") {
    if (working) return;
    setWorking(method === "PATCH" ? "saving" : "purging");
    void requestOk(
      `/api/projects/${projectId}/edge${path}`,
      {
        body: method === "PATCH" ? JSON.stringify(settings) : undefined,
        headers:
          method === "PATCH"
            ? { "content-type": "application/json" }
            : undefined,
        method,
      },
      "Edge configuration failed",
    )
      .then(() =>
        toast.success(
          method === "PATCH"
            ? "Edge settings saved"
            : "Cache purged everywhere",
        ),
      )
      .catch(() =>
        toast.error("The edge didn't accept that. Try again in a moment."),
      )
      .finally(() => setWorking(null));
  }

  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          <>
            <Button
              data-icon-trigger
              disabled={working !== null}
              onClick={() => request("/purge", "POST")}
              size="sm"
              variant="raised"
            >
              <LiveRefresh
                className={working === "purging" ? "animate-spin" : undefined}
                strokeWidth={1.75}
              />
              {working === "purging" ? "Purging…" : "Purge cache"}
            </Button>
            <Button
              disabled={working !== null}
              onClick={() => request("", "PATCH")}
              size="sm"
              variant="hero"
            >
              {working === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
        description="How the edge caches and measures this project, and the storage and routing it serves."
        eyebrow={`${projectName} · Deliver`}
        title="CDN"
      />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <CacheSettingsCard onChange={setSettings} settings={settings} />
        <CdnTelemetryCard onChange={setSettings} settings={settings} />
      </div>
      <ContentPlatformManager
        initialData={initialContent}
        projectId={projectId}
      />
    </PageBody>
  );
}
