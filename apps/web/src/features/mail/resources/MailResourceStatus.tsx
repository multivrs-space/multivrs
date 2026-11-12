import { StatusOrb } from "@/components/dashboard/StatusOrb";
import {
  mailStatusTone,
  statusLabel,
} from "@/features/mail/resources/mail-resource-views";

/** A health orb, or a plain chip when the status is really a kind. */
export function MailResourceStatus({
  status,
  kind,
}: {
  status: string;
  kind: "orb" | "chip";
}) {
  if (!status) return null;
  if (kind === "chip") {
    return (
      <span className="rounded-full border border-hairline px-2 py-0.5 font-geist-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
        {statusLabel(status)}
      </span>
    );
  }
  return (
    <StatusOrb label={statusLabel(status)} pill tone={mailStatusTone(status)} />
  );
}
