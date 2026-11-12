"use client";

import { Suspense, useState } from "react";
import { LiveFileUp } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { ContactImportDialog } from "@/features/mail/contacts/ContactImportDialog";

/** "Import CSV" beside "New contact"; the dialog mounts fresh each time. */
export function ContactImportButton() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  return (
    <>
      <Button
        data-icon-trigger
        onClick={() => {
          setSession((value) => value + 1);
          setOpen(true);
        }}
        size="sm"
        variant="raised"
      >
        <LiveFileUp strokeWidth={2} />
        Import CSV
      </Button>
      {open ? (
        <Suspense fallback={null}>
          <ContactImportDialog key={session} onOpenChange={setOpen} />
        </Suspense>
      ) : null}
    </>
  );
}
