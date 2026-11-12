function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Plain writing keeps its paragraphs and line breaks; HTML is used as is. */
export function broadcastHtml(body: string): string {
  if (/^\s*</.test(body)) return body;
  return body
    .trim()
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
}
