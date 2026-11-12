"use client";

import { useState } from "react";
import { LiveKeyRound, LivePlus } from "@/components/icons/animated";
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
import type { EdgeConfigEntryData } from "@/features/dashboard/types/content-platform.types";

interface EdgeConfigSectionProps {
  busy: string | null;
  entries: EdgeConfigEntryData[];
  projectId: string;
  run: RunAction;
  setData: SetData;
}

/** Small JSON values your code reads at the edge with no round trip. */
export function EdgeConfigSection({
  busy,
  entries,
  projectId,
  run,
  setData,
}: EdgeConfigSectionProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  function parsedValue(): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Edge Config value must be valid JSON");
    }
  }

  const set = () =>
    void run(
      "edge-config-set",
      () =>
        json(`/api/projects/${projectId}/edge-config`, {
          method: "PUT",
          headers: JSON_HEADERS,
          body: JSON.stringify({ key, value: parsedValue() }),
        }),
      (entry) => {
        setData((current) => ({
          ...current,
          edgeConfig: [
            ...current.edgeConfig.filter((item) => item.key !== key),
            entry as EdgeConfigEntryData,
          ].sort((a, b) => a.key.localeCompare(b.key)),
        }));
        setKey("");
        setValue("");
      },
    );
  const remove = (entry: EdgeConfigEntryData) =>
    void run(
      `edge-config-delete-${entry.id}`,
      () =>
        json(
          `/api/projects/${projectId}/edge-config/${encodeURIComponent(entry.key)}`,
          { method: "DELETE" },
        ),
      () =>
        setData((current) => ({
          ...current,
          edgeConfig: current.edgeConfig.filter((item) => item.id !== entry.id),
        })),
    );

  return (
    <ContentSection
      description="Small JSON values, durable and mirrored to the edge snapshot your functions read instantly."
      icon={LiveKeyRound}
      title="Edge Config"
    >
      <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
        <Field label="Key">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setKey(event.target.value)}
            placeholder="checkout.enabled"
            value={key}
          />
        </Field>
        <Field label="JSON value">
          <input
            className={`${CONTENT_FIELD} font-geist-mono`}
            onChange={(event) => setValue(event.target.value)}
            placeholder='{"percentage":25}'
            value={value}
          />
        </Field>
        <Button
          data-icon-trigger
          disabled={busy !== null || !key || !value}
          onClick={set}
          size="sm"
          variant="hero"
        >
          <LivePlus strokeWidth={2} />
          Set
        </Button>
      </div>
      <Rows empty="No values set yet.">
        {entries.map((entry) => (
          <Row
            key={entry.id}
            primary={entry.key}
            secondary={JSON.stringify(entry.value)}
            trailing={
              <DeleteButton
                disabled={busy !== null}
                label={`Delete ${entry.key}`}
                onClick={() => remove(entry)}
              />
            }
          />
        ))}
      </Rows>
    </ContentSection>
  );
}
