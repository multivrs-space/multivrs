"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LiveContactRound, LiveFileUp } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ContactImportColumns } from "@/features/mail/contacts/ContactImportColumns";
import { ContactImportFiles } from "@/features/mail/contacts/ContactImportFiles";
import {
  ContactImportOptions,
  type ImportChoices,
} from "@/features/mail/contacts/ContactImportOptions";
import { ContactImportSummary } from "@/features/mail/contacts/ContactImportSummary";
import { importContactBatches } from "@/features/mail/contacts/contact-import.client";
import { mergeContactFiles } from "@/features/mail/contacts/contact-merge";
import {
  type CsvSource,
  readCsvFiles,
} from "@/features/mail/contacts/read-csv-files";

const MAX_CONTACTS = 100_000;
const count = new Intl.NumberFormat("en-US");

/**
 * Import contacts from one or more CSV exports. Files are read in the
 * browser; only addresses, names, tags and the columns chosen as properties
 * are sent.
 */
export function ContactImportDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { username } = useParams<{ username?: string }>();
  const [sources, setSources] = useState<CsvSource[]>([]);
  const [choices, setChoices] = useState<ImportChoices>({
    audienceId: "",
    tags: "",
    consent: false,
  });
  const [sent, setSent] = useState<number | null>(null);
  const [keep, setKeep] = useState<string[]>([]);
  const merged = useMemo(
    () => mergeContactFiles(sources, keep),
    [sources, keep],
  );
  const total = merged.contacts.length;

  async function add(files: File[]) {
    const read = await readCsvFiles(files);
    setSources((current) => [
      ...current,
      ...read.filter(
        (file) => !current.some((source) => source.key === file.key),
      ),
    ]);
  }

  async function run() {
    setSent(0);
    const result = await importContactBatches(merged.contacts, {
      account: username,
      audienceId: choices.audienceId || undefined,
      tags: choices.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      onProgress: setSent,
    });
    router.refresh();
    const { created, updated } = result.totals;
    if (!result.ok) {
      setSent(null);
      toast.error(
        `${result.message} ${count.format(created + updated)} were saved before it stopped.`,
      );
      return;
    }
    toast.success(
      `${count.format(created)} contacts added${updated ? `, ${count.format(updated)} updated` : ""}`,
    );
    onOpenChange(false);
  }

  const importing = sent !== null;
  const tooMany = total > MAX_CONTACTS;
  return (
    <Dialog onOpenChange={(open) => !importing && onOpenChange(open)} open>
      <DialogContent className={DASH_DIALOG}>
        <DashDialogHeader
          description="Upload exports from your app, store or CRM. Existing contacts keep their subscription status."
          icon={LiveContactRound}
          title="Import contacts"
        />
        <div className="max-h-[60dvh] space-y-4 overflow-y-auto">
          <ContactImportFiles
            files={merged.files}
            onAdd={(files) => void add(files)}
            onRemove={(index) =>
              setSources((current) => current.filter((_, at) => at !== index))
            }
          />
          {sources.length ? <ContactImportSummary merged={merged} /> : null}
          {total ? (
            <ContactImportColumns
              columns={merged.columns}
              keep={keep}
              onChange={setKeep}
            />
          ) : null}
          {total ? (
            <ContactImportOptions choices={choices} onChange={setChoices} />
          ) : null}
          {tooMany ? (
            <p className="text-[12.5px] text-destructive">
              Up to {count.format(MAX_CONTACTS)} contacts per import; remove a
              file and import it separately.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            data-icon-trigger
            disabled={!total || !choices.consent || importing || tooMany}
            onClick={() => void run()}
            size="sm"
            variant="hero"
          >
            <LiveFileUp strokeWidth={2} />
            {importing
              ? `Importing ${count.format(sent)} of ${count.format(total)}…`
              : `Import ${total ? count.format(total) : ""} contacts`.replace(
                  "  ",
                  " ",
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
