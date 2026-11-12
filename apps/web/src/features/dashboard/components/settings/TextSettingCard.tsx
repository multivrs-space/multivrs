"use client";

import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { DASH_FIELD } from "@/components/dashboard/menu";
import type { AnimatedIcon } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

interface TextSettingCardProps {
  id: string;
  icon: AnimatedIcon;
  title: string;
  description: string;
  hint: string;
  value: string;
  maxLength: number;
  placeholder: string;
  /** Shown joined to the left of the field, e.g. the site address. */
  prefix?: ReactNode;
  /** Normalises typing, e.g. lowercase letters, digits and dashes only. */
  clean?: (value: string) => string;
  onSave: (value: string) => Promise<void>;
}

/** One editable text setting with its own Save, enabled only on change. */
export function TextSettingCard({
  id,
  icon,
  title,
  description,
  hint,
  value,
  maxLength,
  placeholder,
  prefix,
  clean,
  onSave,
}: TextSettingCardProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const changed = draft.trim() !== value && draft.trim().length > 0;

  function save() {
    if (!changed || saving) return;
    setSaving(true);
    void onSave(draft.trim())
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error
            ? error.message
            : `Couldn't save the ${title.toLowerCase()}`,
        ),
      )
      .finally(() => setSaving(false));
  }

  return (
    <SettingsCard id={id}>
      <SettingsCardBody description={description} icon={icon} title={title}>
        <div
          className={cn(
            DASH_FIELD,
            "flex h-10 max-w-md items-center overflow-hidden border p-0",
          )}
        >
          {prefix ? (
            <span className="flex h-full items-center border-r border-hairline bg-foreground/[0.03] px-3 font-geist-mono text-[12px] text-muted-foreground">
              {prefix}
            </span>
          ) : null}
          <input
            aria-label={title}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground/60"
            maxLength={maxLength}
            onChange={(event) =>
              setDraft(clean ? clean(event.target.value) : event.target.value)
            }
            onKeyDown={(event) => event.key === "Enter" && save()}
            placeholder={placeholder}
            value={draft}
          />
        </div>
      </SettingsCardBody>
      <SettingsCardFooter
        action={
          <Button
            disabled={!changed || saving}
            onClick={save}
            size="sm"
            variant="hero"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        }
        helperText={hint}
      />
    </SettingsCard>
  );
}
