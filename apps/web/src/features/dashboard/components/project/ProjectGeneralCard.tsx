"use client";

import { FRAMEWORK_IDS } from "@multivrs/config";
import {
  DASH_FIELD,
  DASH_MENU,
  DASH_MENU_ITEM,
} from "@/components/dashboard/menu";
import { LiveSliders } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { cn } from "@/lib/utils";

const LABEL = "block space-y-1.5 text-[12px] font-medium text-muted-foreground";

type Draft = { name?: string; framework?: string; repositoryUrl?: string };

interface ProjectGeneralCardProps {
  name: string;
  framework: string;
  repositoryUrl: string;
  busy: "delete" | "save" | null;
  changed: boolean;
  onChange: (patch: Draft) => void;
  onSave: () => void;
}

/** Name, framework preset and repository, saved together. */
export function ProjectGeneralCard({
  name,
  framework,
  repositoryUrl,
  busy,
  changed,
  onChange,
  onSave,
}: ProjectGeneralCardProps) {
  return (
    <SettingsCard id="general">
      <SettingsCardBody
        description="Changes apply from the next deployment."
        icon={LiveSliders}
        title="General"
      >
        <div className="grid max-w-xl gap-4">
          <label className={LABEL} htmlFor="project-name">
            <span>Project name</span>
            <input
              className={cn(DASH_FIELD, "w-full border px-3")}
              id="project-name"
              maxLength={32}
              onChange={(event) => onChange({ name: event.target.value })}
              value={name}
            />
          </label>
          <div className={LABEL}>
            <span>Framework preset</span>
            <Select
              onValueChange={(value) => onChange({ framework: value })}
              value={framework}
            >
              <SelectTrigger
                aria-label="Framework preset"
                className={cn(DASH_FIELD, "w-full border px-3")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={DASH_MENU}>
                <SelectItem className={DASH_MENU_ITEM} value="auto">
                  Detect automatically
                </SelectItem>
                {FRAMEWORK_IDS.map((id) => (
                  <SelectItem className={DASH_MENU_ITEM} key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className={LABEL} htmlFor="project-repository-url">
            <span>GitHub repository</span>
            <input
              className={cn(
                DASH_FIELD,
                "w-full border px-3 font-geist-mono text-[12.5px]",
              )}
              id="project-repository-url"
              inputMode="url"
              onChange={(event) =>
                onChange({ repositoryUrl: event.target.value })
              }
              placeholder="https://github.com/owner/repository"
              value={repositoryUrl}
            />
          </label>
        </div>
      </SettingsCardBody>
      <SettingsCardFooter
        action={
          <Button
            disabled={busy !== null || !name.trim() || !changed}
            onClick={onSave}
            size="sm"
            variant="hero"
          >
            {busy === "save" ? "Saving…" : "Save changes"}
          </Button>
        }
        helperText="Names can be up to 32 characters."
      />
    </SettingsCard>
  );
}
