import type { MailMessageDetail } from "@/features/mail/mail.types";

// Real emails from Gmail/clients are authored for a light canvas.
// Using explicit high-contrast dark text (#111827) on a clean white canvas
// guarantees readability and matches Resend's email preview canvas.
export const EMAIL_STYLES = `
  html, body {
    margin: 0;
    padding: 0;
    background-color: #ffffff;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14.5px;
    line-height: 1.6;
    word-break: break-word;
  }
  a {
    color: #2563eb;
    text-decoration: underline;
  }
  img {
    max-width: 100%;
  }
  img:not([height]) {
    height: auto;
  }
  table {
    border-collapse: collapse;
    max-width: 100%;
  }
  blockquote, .gmail_quote {
    color: #4b5563;
    border-left: 2px solid #e5e7eb;
    padding-left: 12px;
    margin: 12px 0;
  }
`;

// Automatically resolves inline CID images, protocol-relative URLs,
// and lazy-loading image sources across email providers.
export function resolveEmailHtml(
  html?: string,
  attachments?: MailMessageDetail["attachments"],
): string {
  if (!html) return "";
  let content = html;

  // 1. Resolve embedded CID inline attachments (e.g. cid:image001.png or cid:<image001.png>)
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.contentBase64) {
        const cleanCid = att.contentId?.replace(/[<>]/g, "").trim();
        const dataUri = `data:${att.contentType};base64,${att.contentBase64}`;
        if (cleanCid) {
          content = content.replace(
            new RegExp(
              `cid:<?${cleanCid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>?`,
              "gi",
            ),
            dataUri,
          );
        }
        if (att.filename) {
          content = content.replace(
            new RegExp(
              `cid:<?${att.filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>?`,
              "gi",
            ),
            dataUri,
          );
        }
      }
    }
  }

  // 2. Normalize protocol-relative URLs (e.g. src="//cdn.example.com/...")
  content = content.replace(/src=["']\/\/([^"']+)["']/gi, 'src="https://$1"');

  // 3. Normalize lazy-loaded data-src images:
  // If an img tag has data-src, data-original, data-url, or data-lazy-src:
  // Ensure its src points to the real image URL!
  content = content.replace(/<img\b([^>]*)>/gi, (_match, attrs) => {
    let updatedAttrs = attrs;

    // Check for lazy source attributes
    const lazySrcMatch = attrs.match(
      /\b(?:data-src|data-original|data-url|data-lazy-src)=["']([^"']+)["']/i,
    );
    if (lazySrcMatch?.[1]) {
      const realSrc = lazySrcMatch[1];
      const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);
      const currentSrc = srcMatch ? srcMatch[1] : "";
      const isSpacer =
        !currentSrc ||
        currentSrc.startsWith("data:image/gif") ||
        currentSrc.startsWith("data:image/svg") ||
        currentSrc.includes("spacer") ||
        currentSrc.includes("blank.gif");

      if (isSpacer) {
        if (srcMatch) {
          updatedAttrs = updatedAttrs.replace(
            /\bsrc=["'][^"']*["']/i,
            `src="${realSrc}"`,
          );
        } else {
          updatedAttrs = ` src="${realSrc}" ${updatedAttrs}`;
        }
      }
    }

    // Force eager loading so iframe doesn't defer or cancel image downloads
    updatedAttrs = updatedAttrs.replace(
      /\bloading=["']lazy["']/gi,
      'loading="eager"',
    );

    return `<img${updatedAttrs}>`;
  });

  return content;
}

/** A full HTML document for the sandboxed preview frame. */
export function emailDocument(html: string, text?: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><base target="_blank"><style>${EMAIL_STYLES}</style></head><body>${html || text || ""}</body></html>`;
}

/** Headers and body as plain text, for the Raw tab and copying. */
export function rawMessage(message: MailMessageDetail): string {
  return [
    `From: ${message.fromName ? `${message.fromName} ` : ""}<${message.fromAddress}>`,
    `To: ${message.to.join(", ")}`,
    message.cc.length ? `Cc: ${message.cc.join(", ")}` : null,
    `Subject: ${message.subject}`,
    `Date: ${new Date(message.createdAt).toUTCString()}`,
    `Message-ID: ${message.id}`,
    `Folder: ${message.folder}`,
    `Status: ${message.status}`,
    "",
    "--- Body ---",
    message.text || message.html || "(No content)",
  ]
    .filter((line) => line !== null)
    .join("\n");
}
