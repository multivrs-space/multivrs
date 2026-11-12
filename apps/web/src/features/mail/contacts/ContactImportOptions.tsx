"use client";

import { DASH_FIELD } from "@/components/dashboard/menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MAIL_SELECT } from "@/features/mail/MailFormControls";
import { useMailResources } from "@/features/mail/mail-context";

const LABEL = "block text-[12px] font-medium text-muted-foreground";

export interface ImportChoices {
  audienceId: string;
  tags: string;
  consent: boolean;
}

/** Where imported contacts go, what they're tagged, and the consent check. */
export function ContactImportOptions({
  choices,
  onChange,
}: {
  choices: ImportChoices;
  onChange: (choices: ImportChoices) => void;
}) {
  const { audiences } = useMailResources();
  const set = (next: Partial<ImportChoices>) =>
    onChange({ ...choices, ...next });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={LABEL}>Add to segment (optional)</span>
          <select
            className={MAIL_SELECT}
            onChange={(event) => set({ audienceId: event.target.value })}
            value={choices.audienceId}
          >
            <option value="">No segment</option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1.5">
          <label className={LABEL} htmlFor="import-tags">
            Tags (optional)
          </label>
          <Input
            className={DASH_FIELD}
            id="import-tags"
            onChange={(event) => set({ tags: event.target.value })}
            placeholder="customers, 2026"
            value={choices.tags}
          />
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={choices.consent}
          className="mt-1"
          id="import-consent"
          onCheckedChange={(value) => set({ consent: value === true })}
        />
        <label
          className="text-[12.5px] leading-5 text-muted-foreground"
          htmlFor="import-consent"
        >
          These people agreed to receive email from me. Importing contacts who
          didn't can get your domain blocked.
        </label>
      </div>
    </>
  );
}
