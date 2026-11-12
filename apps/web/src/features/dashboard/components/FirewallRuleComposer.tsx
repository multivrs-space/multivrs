"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD, DASH_MENU } from "@/components/dashboard/menu";
import { LivePlus, LiveShieldCheck } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTION_CHIP,
  ACTIONS,
  CONDITION_TYPES,
  describeCondition,
  OPERATORS,
} from "@/features/dashboard/lib/firewall-copy";
import { requestOk } from "@/lib/api/request.client";
import { cn } from "@/lib/utils";

function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  label: string;
}) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        aria-label={label}
        className={cn(DASH_FIELD, "w-auto min-w-28")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={DASH_MENU}>
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Write a rule as a sentence: "If path starts with /admin then Block". */
export function FirewallRuleComposer({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState("path");
  const [op, setOp] = useState("starts_with");
  const [value, setValue] = useState("");
  const [action, setAction] = useState("deny");
  const [name, setName] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    void requestOk(
      `/api/projects/${projectId}/firewall`,
      {
        body: JSON.stringify({
          action,
          conditions: [{ op, type, value }],
          enabled: true,
          name,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Rule could not be created",
    )
      .then(() => {
        toast.success("Rule saved and on its way to the edge");
        setValue("");
        setName("");
        router.refresh();
      })
      .catch(() =>
        toast.error("The rule wasn't saved. Check the values and try again."),
      )
      .finally(() => setSaving(false));
  }

  return (
    <DashCard aria-label="New rule">
      <DashCardHeader
        description="Rules apply at the edge in order; the first match wins"
        icon={LiveShieldCheck}
        title="New rule"
      />
      <form className="space-y-4 p-5 pt-4" onSubmit={submit}>
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-medium text-muted-foreground">If</span>
          <Choice
            label="Field"
            onChange={setType}
            options={CONDITION_TYPES}
            value={type}
          />
          <Choice
            label="Comparison"
            onChange={setOp}
            options={OPERATORS}
            value={op}
          />
          <Input
            aria-label="Value"
            className={cn(DASH_FIELD, "w-48 font-geist-mono")}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/admin"
            required
            value={value}
          />
          <span className="font-medium text-muted-foreground">then</span>
          <Choice
            label="Action"
            onChange={setAction}
            options={ACTIONS}
            value={action}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Rule name"
            className={cn(DASH_FIELD, "min-w-48 flex-1")}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name this rule, e.g. Lock down admin"
            required
            value={name}
          />
          <Button
            data-icon-trigger
            disabled={saving}
            type="submit"
            variant="hero"
          >
            <LivePlus strokeWidth={2} />
            {saving ? "Adding…" : "Add rule"}
          </Button>
        </div>
        <p className="surface-inset flex flex-wrap items-center gap-2 rounded-tile px-3 py-2.5 text-[12.5px] text-muted-foreground">
          Preview:
          <span className="text-foreground">
            If {describeCondition(type, op, value || "…")}
          </span>
          →
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              ACTION_CHIP[action],
            )}
          >
            {ACTIONS[action]}
          </span>
        </p>
      </form>
    </DashCard>
  );
}
