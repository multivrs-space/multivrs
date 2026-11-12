"use client";

import { useRef, useState } from "react";
import {
  LiveArrowUpRight,
  LiveCloud,
  LiveFileUp,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  CONTENT_FIELD,
  ContentSection,
  DeleteButton,
  Field,
  Row,
  Rows,
} from "@/features/dashboard/components/content-platform/ContentParts";
import {
  formatBytes,
  JSON_HEADERS,
  json,
  type RunAction,
  type SetData,
} from "@/features/dashboard/components/content-platform/content-actions";
import type { BlobData } from "@/features/dashboard/types/content-platform.types";

interface BlobSectionProps {
  busy: string | null;
  blobs: BlobData[];
  projectId: string;
  run: RunAction;
  setData: SetData;
}

/** Upload files straight to storage and serve them publicly or signed. */
export function BlobSection({
  busy,
  blobs,
  projectId,
  run,
  setData,
}: BlobSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pathname, setPathname] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("public");

  async function upload(): Promise<BlobData> {
    const file = fileRef.current?.files?.[0];
    if (!file) throw new Error("Choose a file first");
    const prepared = await json<{
      blob: BlobData;
      headers: Record<string, string>;
      uploadUrl: string;
    }>(`/api/projects/${projectId}/blobs`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        contentType: file.type || "application/octet-stream",
        pathname: pathname || file.name,
        size: file.size,
        visibility,
      }),
    });
    const uploaded = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: prepared.headers,
      body: file,
    });
    if (!uploaded.ok) throw new Error(`Upload failed (${uploaded.status})`);
    return json(
      `/api/projects/${projectId}/blobs/${prepared.blob.id}/complete`,
      { method: "POST" },
    );
  }

  const open = (blob: BlobData) =>
    void run(
      `blob-open-${blob.id}`,
      () =>
        json<{ downloadUrl: string; edgeUrl: string | null }>(
          `/api/projects/${projectId}/blobs/${blob.id}`,
        ),
      (access) =>
        window.open(
          access.edgeUrl ?? access.downloadUrl,
          "_blank",
          "noopener,noreferrer",
        ),
    );
  const remove = (blob: BlobData) =>
    void run(
      `blob-delete-${blob.id}`,
      () =>
        json(`/api/projects/${projectId}/blobs/${blob.id}`, {
          method: "DELETE",
        }),
      () =>
        setData((current) => ({
          ...current,
          blobs: current.blobs.filter((item) => item.id !== blob.id),
        })),
    );

  return (
    <ContentSection
      description="Files upload directly to storage, are verified, then served from public or signed private URLs."
      icon={LiveCloud}
      title="Blob storage"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
        <Field label="File">
          <input
            className={`${CONTENT_FIELD} pt-1.5 file:mr-3 file:border-0 file:bg-transparent file:text-xs file:text-foreground`}
            ref={fileRef}
            type="file"
          />
        </Field>
        <Field label="Path">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setPathname(event.target.value)}
            placeholder="images/hero.png"
            value={pathname}
          />
        </Field>
        <Field label="Visibility">
          <select
            className={CONTENT_FIELD}
            onChange={(event) =>
              setVisibility(
                event.target.value === "private" ? "private" : "public",
              )
            }
            value={visibility}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </Field>
        <Button
          data-icon-trigger
          disabled={busy !== null}
          onClick={() =>
            void run("blob-upload", upload, (blob) =>
              setData((current) => ({
                ...current,
                blobs: [
                  blob,
                  ...current.blobs.filter((item) => item.id !== blob.id),
                ],
              })),
            )
          }
          size="sm"
          variant="hero"
        >
          <LiveFileUp strokeWidth={1.75} />
          Upload
        </Button>
      </div>
      <Rows empty="No files uploaded yet.">
        {blobs.map((blob) => (
          <Row
            key={blob.id}
            primary={blob.pathname}
            secondary={`${formatBytes(blob.size)} · ${blob.contentType} · ${blob.visibility}`}
            trailing={
              <>
                <Button
                  aria-label={`Open ${blob.pathname}`}
                  className="size-8"
                  data-icon-trigger
                  onClick={() => open(blob)}
                  size="icon-sm"
                  variant="quiet"
                >
                  <LiveArrowUpRight strokeWidth={2} />
                </Button>
                <DeleteButton
                  disabled={busy !== null}
                  label={`Delete ${blob.pathname}`}
                  onClick={() => remove(blob)}
                />
              </>
            }
          />
        ))}
      </Rows>
    </ContentSection>
  );
}
