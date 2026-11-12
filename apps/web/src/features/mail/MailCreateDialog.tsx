"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import { DASH_DIALOG } from "@/components/dashboard/menu";
import { LivePlus } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { MailCreateFields } from "@/features/mail/MailCreateFields";
import type { MailResources } from "@/features/mail/mail.types";
import { submitMailResource } from "@/features/mail/mail-resource.client";
import {
  type CreateMailView,
  createMailLabel,
} from "@/features/mail/mail-resource-form";
import {
  MailSecretReveal,
  type SmtpConnection,
} from "@/features/mail/resources/MailSecretReveal";
import { mailResourceView } from "@/features/mail/resources/mail-resource-views";

/** Create any mail resource; secrets are revealed once before closing. */
export function MailCreateDialog({
  resources,
  onOpenChange,
  open,
  projectId,
  view,
}: {
  resources: MailResources;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  projectId?: string;
  view: CreateMailView;
}) {
  const router = useRouter();
  const params = useParams<{ username?: string; scope?: string }>();
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string>();
  const [connection, setConnection] = useState<SmtpConnection>();
  const noun = createMailLabel(view).toLowerCase();

  const resetSecret = () => {
    setSecret(undefined);
    setConnection(undefined);
  };
  function submit(formData: FormData) {
    setSaving(true);
    void submitMailResource(view, formData, projectId, params.username).then(
      (result) => {
        setSaving(false);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        toast.success(`${createMailLabel(view)} created`);
        if (result.secret) {
          setSecret(result.secret);
          setConnection(result.connection);
        } else {
          onOpenChange(false);
          if (
            view === "domains" &&
            result.id &&
            params.username &&
            params.scope
          ) {
            if (result.setupError) {
              toast.warning("Domain added, but automatic DNS needs attention");
            } else if (result.dnsMode === "automatic") {
              toast.info(
                "Multivrs added the required DNS records automatically",
              );
            }
            router.push(
              `/${params.username}/${params.scope}/email/domains/${result.id}`,
            );
          }
        }
        router.refresh();
      },
    );
  }
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          resetSecret();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className={DASH_DIALOG}>
        <DashDialogHeader
          description={
            secret
              ? view === "credentials"
                ? "Store it in a secret manager; Multivrs keeps only a hash."
                : "Store it in a secret manager; it is shown only this once."
              : `Stored in Multivrs for ${projectId ? "this project" : "this account"}.`
          }
          icon={mailResourceView(view).icon}
          title={secret ? "Copy your secret" : `New ${noun}`}
        />
        {secret ? (
          <MailSecretReveal
            connection={connection}
            onDone={() => {
              resetSecret();
              onOpenChange(false);
            }}
            secret={secret}
          />
        ) : (
          <form action={submit} className="space-y-4">
            <MailCreateFields resources={resources} view={view} />
            <DialogFooter>
              <Button
                data-icon-trigger
                disabled={saving}
                size="sm"
                type="submit"
                variant="hero"
              >
                <LivePlus strokeWidth={2} />
                {saving ? "Creating…" : `Create ${noun}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
