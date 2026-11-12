"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { ToggleChips } from "@/components/dashboard/ToggleChips";
import { LiveLock, LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EnvironmentTarget } from "@/features/dashboard/types/environment-variable.types";
import { requestOk } from "@/lib/api/request.client";

const TARGETS: { value: EnvironmentTarget; label: string }[] = [
  { value: "production", label: "Production" },
  { value: "preview", label: "Preview" },
  { value: "development", label: "Development" },
];

/** Add an encrypted variable and choose which environments receive it. */
export function EnvironmentVariableForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [targets, setTargets] = useState<EnvironmentTarget[]>([
    "production",
    "preview",
  ]);
  const [saving, setSaving] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    void requestOk(
      `/api/projects/${projectId}/environment`,
      {
        body: JSON.stringify({ key, targets, value }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Variable could not be saved",
    )
      .then(() => {
        toast.success(`${key} saved`);
        setKey("");
        setValue("");
        router.refresh();
      })
      .catch(() =>
        toast.error(
          "Couldn't save the variable. Check the encryption key and try again.",
        ),
      )
      .finally(() => setSaving(false));
  }

  return (
    <DashCard aria-label="Add variable">
      <DashCardHeader
        description="Encrypted with AES-256-GCM; the value is never shown again"
        icon={LiveLock}
        title="Add variable"
      />
      <form
        className="grid gap-3 p-5 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"
        onSubmit={submit}
      >
        <Input
          aria-label="Variable name"
          className={`${DASH_FIELD} font-geist-mono`}
          onChange={(event) =>
            setKey(event.target.value.toUpperCase().replace(/\s+/g, "_"))
          }
          placeholder="DATABASE_URL"
          required
          value={key}
        />
        <Input
          aria-label="Variable value"
          autoComplete="off"
          className={`${DASH_FIELD} font-geist-mono`}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Value"
          required
          type="password"
          value={value}
        />
        <Button
          data-icon-trigger
          disabled={saving || !targets.length}
          type="submit"
          variant="hero"
        >
          <LivePlus strokeWidth={2} />
          {saving ? "Saving…" : "Save"}
        </Button>
        <ToggleChips
          className="lg:col-span-3"
          label="Environments"
          onToggle={(target) =>
            setTargets((current) =>
              current.includes(target)
                ? current.filter((item) => item !== target)
                : [...current, target],
            )
          }
          options={TARGETS}
          selected={targets}
        />
      </form>
    </DashCard>
  );
}
