"use client";

import { useState } from "react";
import { LiveBoxes, LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CONTENT_FIELD,
  ContentSection,
  DeleteButton,
  Field,
  Row,
  Rows,
} from "@/features/dashboard/components/content-platform/ContentParts";
import {
  JSON_HEADERS,
  json,
  type RunAction,
  type SetData,
} from "@/features/dashboard/components/content-platform/content-actions";
import type {
  ContentPlatformData,
  MicrofrontendRouteData,
} from "@/features/dashboard/types/content-platform.types";

interface MicrofrontendSectionProps {
  busy: string | null;
  data: ContentPlatformData;
  projectId: string;
  run: RunAction;
  setData: SetData;
}

/** Serve another project's production deployment under a path of this one. */
export function MicrofrontendSection({
  busy,
  data,
  projectId,
  run,
  setData,
}: MicrofrontendSectionProps) {
  const [source, setSource] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(
    data.targetProjects[0]?.id ?? "",
  );
  const [stripPrefix, setStripPrefix] = useState(true);

  const mount = () =>
    void run(
      "microfrontend-create",
      () =>
        json(`/api/projects/${projectId}/microfrontends`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ source, stripPrefix, targetProjectId }),
        }),
      (route) => {
        setData((current) => ({
          ...current,
          microfrontends: [
            ...current.microfrontends,
            route as MicrofrontendRouteData,
          ],
        }));
        setSource("");
      },
    );
  const remove = (route: MicrofrontendRouteData) =>
    void run(
      `microfrontend-delete-${route.id}`,
      () =>
        json(`/api/projects/${projectId}/microfrontends/${route.id}`, {
          method: "DELETE",
        }),
      () =>
        setData((current) => ({
          ...current,
          microfrontends: current.microfrontends.filter(
            (item) => item.id !== route.id,
          ),
        })),
    );

  return (
    <ContentSection
      description="Mount another project's production deployment under a path, keeping this hostname."
      icon={LiveBoxes}
      title="Microfrontend routing"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <Field label="Mount path">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setSource(event.target.value)}
            placeholder="/docs/:path*"
            value={source}
          />
        </Field>
        <Field label="Project">
          <select
            className={CONTENT_FIELD}
            onChange={(event) => setTargetProjectId(event.target.value)}
            value={targetProjectId}
          >
            <option value="">Choose project</option>
            {data.targetProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: the Switch is the control; clicking the text toggles it. */}
        <label className="flex h-9 items-center gap-2 text-xs text-muted-foreground">
          <Switch
            aria-label="Strip the mount path"
            checked={stripPrefix}
            onCheckedChange={setStripPrefix}
            size="sm"
          />
          Strip mount path
        </label>
        <Button
          data-icon-trigger
          disabled={busy !== null || !source || !targetProjectId}
          onClick={mount}
          size="sm"
          variant="hero"
        >
          <LivePlus strokeWidth={2} />
          Mount
        </Button>
      </div>
      <Rows empty="No projects mounted yet.">
        {data.microfrontends.map((route) => (
          <Row
            key={route.id}
            primary={`${route.source} → ${route.targetProjectName}`}
            secondary={
              route.stripPrefix ? "Mount path stripped" : "Full path forwarded"
            }
            trailing={
              <DeleteButton
                disabled={busy !== null}
                label={`Unmount ${route.source}`}
                onClick={() => remove(route)}
              />
            }
          />
        ))}
      </Rows>
    </ContentSection>
  );
}
