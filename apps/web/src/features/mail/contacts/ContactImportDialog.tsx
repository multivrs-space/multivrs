"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LiveContactRound, LiveFileUp } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ContactImportFiles } from "@/features/mail/contacts/ContactImportFiles";
import {
  ContactImportOptions,
  type ImportChoices,
} from "@/features/mail/contacts/ContactImportOptions";
import { ContactImportSummary } from "@/features/mail/contacts/ContactImportSummary";
import { importContactBatches } from "@/features/mail/contacts/contact-import.client";
import { mergeContactFiles } from "@/features/mail/contacts/contact-merge";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_CONTACTS = 100_000;
const count = new Intl.NumberFormat("en-US");

interface Source {
  key: string;
  name: string;
  text: string;
}

/**
 * Import contacts from one or more CSV exports. Files are read in the
 * browser and only addresses, names and tags are sent, never other columns.
 */
export function ContactImportDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { username } = useParams<{ username?: string }>();
  const [sources, setSources] = useState<Source[]>([]);
  const [choices, setChoices] = useState<ImportChoices>({
    audienceId: "",
    tags: "",
    consent: false,
  });
  const [sent, setSent] = useState<number | null>(null);
  const merged = useMemo(() => mergeContactFiles(sources), [sources]);
  const total = merged.contacts.length;

  async function add(files: File[]) {
    const csv = files.filter(
      (file) => /\.csv$/i.test(file.name) || file.type === "text/csv",
    );
    if (csv.length < files.length)
      toast.error("Only .csv files can be imported");
    const large = csv.find((file) => file.size > MAX_FILE_BYTES);
    if (large)
      toast.error(`${large.name} is over 25 MB; split it into smaller files`);
    const read = await Promise.all(
      csv
        .filter((file) => file.size <= MAX_FILE_BYTES)
        .map(async (file) => ({
          key: `${file.name}:${file.size}:${file.lastModified}`,
          name: file.name,
          text: await file.text(),
        })),
    );
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
