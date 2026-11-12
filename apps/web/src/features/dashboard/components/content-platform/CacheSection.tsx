"use client";

import { useState } from "react";
import { LiveFileUp, LiveRefresh } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  CONTENT_FIELD,
  ContentSection,
  Field,
} from "@/features/dashboard/components/content-platform/ContentParts";
import {
  JSON_HEADERS,
  json,
  type RunAction,
  type SetData,
} from "@/features/dashboard/components/content-platform/content-actions";
import type { ContentPlatformData } from "@/features/dashboard/types/content-platform.types";

/** How long pages stay fresh, how long stale ones may serve, and revalidation. */
export function CacheSection({
  busy,
  data,
  projectId,
  run,
  setData,
}: {
  busy: string | null;
  data: ContentPlatformData;
  projectId: string;
  run: RunAction;
  setData: SetData;
}) {
  const [fresh, setFresh] = useState(String(data.settings.defaultRevalidate));
  const [stale, setStale] = useState(String(data.settings.staleWindow));
  const [tag, setTag] = useState("");

  const save = () =>
    void run(
      "cache-save",
      () =>
        json(`/api/projects/${projectId}/content`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            defaultRevalidate: Number(fresh),
            staleWindow: Number(stale),
          }),
        }),
      (settings) =>
        setData((current) => ({
          ...current,
          settings: settings as ContentPlatformData["settings"],
        })),
    );
  const revalidate = () =>
    void run(
      "cache-revalidate",
      () =>
        json(`/api/projects/${projectId}/content/revalidate`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(tag ? { tag } : {}),
        }),
      () => undefined,
    );

  return (
    <ContentSection
      description="Fresh pages are cached. Stale ones serve instantly while a single regeneration runs behind them."
      icon={LiveFileUp}
      title="ISR and stale revalidation"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fresh for (seconds)">
          <input
            className={CONTENT_FIELD}
            inputMode="numeric"
            onChange={(event) => setFresh(event.target.value)}
            value={fresh}
          />
        </Field>
        <Field label="Serve stale for up to (seconds)">
          <input
            className={CONTENT_FIELD}
            inputMode="numeric"
            onChange={(event) => setStale(event.target.value)}
            value={stale}
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          disabled={busy !== null}
          onClick={save}
          size="sm"
          variant="hero"
        >
          Save cache policy
        </Button>
        <span className="mx-1 h-6 w-px bg-hairline-strong" />
        <input
          aria-label="Optional cache tag"
          className={`${CONTENT_FIELD} max-w-56 font-geist-mono`}
          onChange={(event) => setTag(event.target.value)}
          placeholder="Optional tag, e.g. products"
          value={tag}
        />
        <Button
          data-icon-trigger
          disabled={busy !== null}
          onClick={revalidate}
          size="sm"
          variant="raised"
        >
          <LiveRefresh strokeWidth={1.75} />
          Revalidate {tag ? "tag" : "everything"}
        </Button>
      </div>
    </ContentSection>
  );
}
