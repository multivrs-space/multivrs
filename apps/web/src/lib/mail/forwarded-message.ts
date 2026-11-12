/**
 * A forward the way mail clients send one: your note, a "Forwarded message"
 * header, then the original email as it was, its HTML and layout untouched
 * rather than retyped through the editor.
 */

interface ForwardedOriginal {
  fromName: string | null;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  subject: string;
  htmlBody: string | null;
  textBody: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
}

const DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function headerLines(original: ForwardedOriginal) {
  const sender = original.fromName
    ? `${original.fromName} <${original.fromAddress}>`
    : original.fromAddress;
  return [
    ["From", sender],
    [
      "Date",
      DATE.format(original.sentAt ?? original.receivedAt ?? original.createdAt),
    ],
    ["Subject", original.subject],
    ["To", original.toAddresses.join(", ")],
    ...(original.ccAddresses.length
      ? [["Cc", original.ccAddresses.join(", ")]]
      : []),
  ] as const;
}

export function forwardedContent(
  original: ForwardedOriginal,
  note: { html?: string; text?: string },
): { html: string; text: string } {
  const lines = headerLines(original);
  const header = `<div style="color:#5f6368;font-size:13px">---------- Forwarded message ---------<br>${lines
    .map(([label, value]) => `${label}: ${escapeHtml(value)}`)
    .join("<br>")}</div><br>`;
  const body =
    original.htmlBody ??
    `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(original.textBody ?? "")}</pre>`;
  const noteHtml =
    note.html ?? (note.text ? `<p>${escapeHtml(note.text)}</p>` : "");
  return {
    html: `${noteHtml}<br>${header}<div>${body}</div>`,
    text: [
      note.text ?? "",
      "",
      "---------- Forwarded message ---------",
      ...lines.map(([label, value]) => `${label}: ${value}`),
      "",
      original.textBody ?? "",
    ]
      .join("\n")
      .trim(),
  };
}
