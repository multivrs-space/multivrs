"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import { LiveTrash } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";

/**
 * Removes the sending domain from Multivrs and AWS. Adding it again starts
 * a fresh AWS check with new DKIM records.
 */
export function MailDomainDeleteButton({
  domainId,
  domain,
  backHref,
}: {
  domainId: string;
  domain: string;
  backHref: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    const response = await fetch(`/api/mail/domains/${domainId}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!response?.ok) {
      toast.error(
        await responseError(response, "Couldn't remove the domain. Try again."),
      );
      setDeleting(false);
      return;
    }
    toast.success(`${domain} removed`);
    router.push(backHref);
    router.refresh();
  }

  return (
    <>
      <Button
        data-icon-trigger
        disabled={deleting}
        onClick={() => setConfirming(true)}
        size="sm"
        variant="danger"
      >
        <LiveTrash strokeWidth={1.75} />
        Remove
      </Button>
      <ConfirmDialog
        busy={deleting}
        confirmLabel="Remove"
        description="This removes it from Multivrs. You can add it again to get new DKIM records, then replace the old ones at your DNS provider."
        onConfirm={() => void remove()}
        onOpenChange={setConfirming}
        open={confirming}
        title={`Remove ${domain}?`}
      />
    </>
  );
}
