"use client";

import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveGlobe,
  LiveHistory,
  LivePlus,
  LiveTrash,
  LiveWorkflow,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  describeCron,
  type EditableStep,
} from "@/features/dashboard/lib/workflow-steps";

interface WorkflowComposerProps {
  name: string;
  cron: string;
  steps: EditableStep[];
  pending: boolean;
  onName: (value: string) => void;
  onCron: (value: string) => void;
  onStep: (clientId: string, update: Partial<EditableStep>) => void;
  onRemove: (clientId: string) => void;
  onAdd: (type: "http" | "delay") => void;
  onCreate: () => void;
}

/** Build a workflow as a vertical chain of steps, with an optional schedule. */
export function WorkflowComposer(props: WorkflowComposerProps) {
  const readable = props.cron.trim() ? describeCron(props.cron) : null;
  return (
    <DashCard aria-label="New workflow">
      <DashCardHeader
        description="Durable HTTP calls and waits, run on demand or on a schedule"
        icon={LiveWorkflow}
        title="New workflow"
      />
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <label
          className="space-y-1.5 text-xs font-medium"
          htmlFor="workflow-name"
        >
          Name
          <Input
            className={DASH_FIELD}
            id="workflow-name"
            onChange={(event) => props.onName(event.target.value)}
            placeholder="Daily sync"
            value={props.name}
          />
        </label>
        <label
          className="space-y-1.5 text-xs font-medium"
          htmlFor="workflow-cron"
        >
          Schedule{" "}
          <span className="font-normal text-muted-foreground">
            (UTC cron, optional)
          </span>
          <Input
            className={`${DASH_FIELD} font-geist-mono`}
            id="workflow-cron"
            onChange={(event) => props.onCron(event.target.value)}
            placeholder="0 6 * * *"
            value={props.cron}
          />
          <span className="block min-h-4 font-normal text-muted-foreground">
            {readable ??
              (props.cron.trim()
                ? "Custom schedule"
                : "Runs only when triggered")}
          </span>
        </label>
      </div>

      <ol className="relative space-y-2 px-5">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-[35px] top-4 w-px bg-hairline-strong"
        />
        {props.steps.map((step, index) => (
          <li className="relative flex items-start gap-3" key={step.clientId}>
            <span className="surface-raised z-10 grid size-8 shrink-0 place-items-center rounded-full font-geist-mono text-[11px] text-muted-foreground">
              {index + 1}
            </span>
            <div className="surface-inset grid flex-1 gap-2 rounded-tile p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
              <Input
                aria-label={`Step ${index + 1} name`}
                className={DASH_FIELD}
                onChange={(event) =>
                  props.onStep(step.clientId, { name: event.target.value })
                }
                placeholder="Step name"
                value={step.name}
              />
              {step.type === "http" ? (
                <Input
                  aria-label={`Step ${index + 1} URL`}
                  className={`${DASH_FIELD} font-geist-mono`}
                  onChange={(event) =>
                    props.onStep(step.clientId, { url: event.target.value })
                  }
                  placeholder="https://api.example.com/sync"
                  type="url"
                  value={step.url ?? ""}
                />
              ) : (
                // biome-ignore lint/a11y/noLabelWithoutControl: the Input inside is the control.
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Input
                    aria-label={`Step ${index + 1} wait seconds`}
                    className={DASH_FIELD}
                    max={2_592_000}
                    min={1}
                    onChange={(event) =>
                      props.onStep(step.clientId, {
                        durationSeconds: Number(event.target.value),
                      })
                    }
                    type="number"
                    value={step.durationSeconds ?? 60}
                  />
                  seconds
                </label>
              )}
              <Button
                aria-label={`Remove step ${index + 1}`}
                className="size-9"
                data-icon-trigger
                disabled={props.steps.length === 1}
                onClick={() => props.onRemove(step.clientId)}
                size="icon"
                variant="quiet"
              >
                <LiveTrash strokeWidth={1.75} />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2 p-5">
        <Button
          data-icon-trigger
          onClick={() => props.onAdd("http")}
          size="sm"
          variant="raised"
        >
          <LiveGlobe strokeWidth={1.75} />
          HTTP step
        </Button>
        <Button
          data-icon-trigger
          onClick={() => props.onAdd("delay")}
          size="sm"
          variant="raised"
        >
          <LiveHistory strokeWidth={1.75} />
          Wait step
        </Button>
        <Button
          className="ml-auto"
          data-icon-trigger
          disabled={props.pending || !props.name.trim()}
          onClick={props.onCreate}
          size="sm"
          variant="hero"
        >
          <LivePlus strokeWidth={2} />
          {props.pending ? "Saving…" : "Create workflow"}
        </Button>
      </div>
    </DashCard>
  );
}
