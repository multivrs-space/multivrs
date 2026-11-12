"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LivePlus, LiveWorkflow } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { WorkflowCard } from "@/features/dashboard/components/workflows/WorkflowCard";
import { WorkflowComposer } from "@/features/dashboard/components/workflows/WorkflowComposer";
import {
  cleanStep,
  type EditableStep,
  newDelayStep,
  newHttpStep,
} from "@/features/dashboard/lib/workflow-steps";
import type { DashboardWorkflow } from "@/features/dashboard/types/platform-workflow.types";
import { requestOk } from "@/lib/api/request.client";

const JSON_HEADERS = { "content-type": "application/json" };

/** Durable workflows for one project: build one, see them all, run any. */
export function WorkflowsPage({
  projectId,
  projectName,
  workflows,
}: {
  projectId: string;
  projectName: string;
  workflows: DashboardWorkflow[];
}) {
  const router = useRouter();
  const [composing, setComposing] = useState(workflows.length === 0);
  const [name, setName] = useState("");
  const [cron, setCron] = useState("");
  const [steps, setSteps] = useState<EditableStep[]>(() => [
    newHttpStep("initial-http"),
  ]);
  const [pending, startTransition] = useTransition();

  function createWorkflow() {
    startTransition(async () => {
      try {
        await requestOk(
          `/api/projects/${projectId}/workflows`,
          {
            body: JSON.stringify({
              cron: cron.trim() || undefined,
              enabled: true,
              name,
              steps: steps.map(({ clientId: _clientId, ...step }) =>
                cleanStep(step),
              ),
            }),
            headers: JSON_HEADERS,
            method: "POST",
          },
          "Workflow creation failed",
        );
        setName("");
        setCron("");
        setSteps([newHttpStep()]);
        setComposing(false);
        toast.success("Workflow created");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Workflow creation failed",
        );
      }
    });
  }

  function runWorkflow(workflowId: string) {
    startTransition(async () => {
      try {
        await requestOk(
          `/api/projects/${projectId}/workflows/${workflowId}/run`,
          {
            body: JSON.stringify({ input: { source: "dashboard" } }),
            headers: JSON_HEADERS,
            method: "POST",
          },
          "Workflow dispatch failed",
        );
        toast.success("Workflow queued");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Workflow dispatch failed",
        );
      }
    });
  }

  return (
    <PageBody>
      <DashboardPageHeader
        actions={
          composing ? null : (
            <Button
              data-icon-trigger
              onClick={() => setComposing(true)}
              size="sm"
              variant="hero"
            >
              <LivePlus strokeWidth={2} />
              New workflow
            </Button>
          )
        }
        description="Durable steps that retry on failure, run on demand or on a UTC schedule."
        eyebrow={`${projectName} · Workflows`}
        title="Workflows"
      />
      {composing ? (
        <WorkflowComposer
          cron={cron}
          name={name}
          onAdd={(type) =>
            setSteps((current) => [
              ...current,
              type === "http" ? newHttpStep() : newDelayStep(),
            ])
          }
          onCreate={createWorkflow}
          onCron={setCron}
          onName={setName}
          onRemove={(clientId) =>
            setSteps((current) =>
              current.filter((step) => step.clientId !== clientId),
            )
          }
          onStep={(clientId, update) =>
            setSteps((current) =>
              current.map((step) =>
                step.clientId === clientId ? { ...step, ...update } : step,
              ),
            )
          }
          pending={pending}
          steps={steps}
        />
      ) : null}
      {workflows.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              onRun={() => runWorkflow(workflow.id)}
              pending={pending}
              workflow={workflow}
            />
          ))}
        </div>
      ) : composing ? null : (
        <DashCard>
          <EmptyState
            description="Chain HTTP calls and waits that retry on failure."
            glyph={LiveWorkflow}
            title="No workflows yet"
          />
        </DashCard>
      )}
    </PageBody>
  );
}
