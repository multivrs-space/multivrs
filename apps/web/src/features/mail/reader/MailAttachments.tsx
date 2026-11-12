import { formatBytes } from "@/components/dashboard/lib/units";
import {
  LiveDownload,
  LiveFileText,
  LiveImage,
} from "@/components/icons/animated";
import type { MailAttachmentItem } from "@/features/mail/mail.types";

/** Files on a message, each with its size and a download when we have it. */
export function MailAttachments({
  attachments,
}: {
  attachments: MailAttachmentItem[];
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 flex items-center gap-2 font-geist-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        Attachments{" "}
        <span className="text-foreground">{attachments.length}</span>
      </p>
      <ul className="flex flex-wrap gap-2">
        {attachments.map((file) => {
          const Icon = file.contentType.startsWith("image/")
            ? LiveImage
            : LiveFileText;
          const href = file.contentBase64
            ? `data:${file.contentType};base64,${file.contentBase64}`
            : undefined;
          return (
            <li
              className="surface-raised flex max-w-[280px] items-center gap-2.5 rounded-tile py-2 pl-2.5 pr-1.5"
              data-icon-trigger
              key={file.id || file.filename}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary/10 text-primary">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-foreground">
                  {file.filename}
                </span>
                <span className="block font-geist-mono text-[10.5px] text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </span>
              {href ? (
                <a
                  aria-label={`Download ${file.filename}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  download={file.filename}
                  href={href}
                >
                  <LiveDownload className="size-3.5" strokeWidth={1.75} />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
