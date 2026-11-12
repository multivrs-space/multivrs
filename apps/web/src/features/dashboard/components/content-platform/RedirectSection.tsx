"use client";

import { useState } from "react";
import { LivePlus, LiveSend } from "@/components/icons/animated";
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
  JSON_HEADERS,
  json,
  type RunAction,
  type SetData,
} from "@/features/dashboard/components/content-platform/content-actions";
import type { BulkRedirectData } from "@/features/dashboard/types/content-platform.types";

const STATUS_CODES = [301, 302, 307, 308] as const;
type StatusCode = (typeof STATUS_CODES)[number];

interface RedirectSectionProps {
  busy: string | null;
  projectId: string;
  redirects: BulkRedirectData[];
  run: RunAction;
  setData: SetData;
}

/** Ordered path redirects that run at the edge before anything else. */
export function RedirectSection({
  busy,
  projectId,
  redirects,
  run,
  setData,
}: RedirectSectionProps) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [statusCode, setStatusCode] = useState<StatusCode>(308);

  const create = () =>
    void run(
      "redirect-create",
      () =>
        json(`/api/projects/${projectId}/redirects`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ destination, source, statusCode }),
        }),
      (redirect) => {
        setData((current) => ({
          ...current,
          redirects: [...current.redirects, redirect as BulkRedirectData],
        }));
        setSource("");
        setDestination("");
      },
    );
  const remove = (redirect: BulkRedirectData) =>
    void run(
      `redirect-delete-${redirect.id}`,
      () =>
        json(`/api/projects/${projectId}/redirects/${redirect.id}`, {
          method: "DELETE",
        }),
      () =>
        setData((current) => ({
          ...current,
          redirects: current.redirects.filter(
            (item) => item.id !== redirect.id,
          ),
        })),
    );

  return (
    <ContentSection
      description="Path-pattern redirects run at the edge before files or functions. Named parameters and catch-alls work."
      icon={LiveSend}
      title="Bulk redirects"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_110px_auto] md:items-end">
        <Field label="From">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setSource(event.target.value)}
            placeholder="/old/:path*"
            value={source}
          />
        </Field>
        <Field label="To">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="/new/:path*"
            value={destination}
          />
        </Field>
        <Field label="Status">
          <select
            className={CONTENT_FIELD}
            onChange={(event) =>
              setStatusCode(
                STATUS_CODES.find(
                  (code) => code === Number(event.target.value),
                ) ?? 308,
              )
            }
            value={statusCode}
          >
            {STATUS_CODES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Button
          data-icon-trigger
          disabled={busy !== null || !source || !destination}
          onClick={create}
          size="sm"
          variant="hero"
        >
          <LivePlus strokeWidth={2} />
          Add
        </Button>
      </div>
      <Rows empty="No redirects yet.">
        {redirects.map((redirect) => (
          <Row
            key={redirect.id}
            primary={`${redirect.source} → ${redirect.destination}`}
            secondary={`${redirect.statusCode} · ${redirect.preserveQuery ? "keeps the query string" : "drops the query string"}`}
            trailing={
              <DeleteButton
                disabled={busy !== null}
                label={`Delete redirect from ${redirect.source}`}
                onClick={() => remove(redirect)}
              />
            }
          />
        ))}
      </Rows>
    </ContentSection>
  );
}
