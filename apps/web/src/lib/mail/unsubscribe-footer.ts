function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** The line under every broadcast: who sent it and how to stop getting them. */
export function unsubscribeFooter(sender: string, url: string) {
  return {
    html: `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e4e4e7;font-size:12px;line-height:18px;color:#71717a">You're getting this because you subscribed to ${escapeHtml(sender)}. <a href="${escapeHtml(url)}" style="color:#71717a;text-decoration:underline">Unsubscribe</a></p>`,
    text: `\n\n---\nYou're getting this because you subscribed to ${sender}.\nUnsubscribe: ${url}`,
  };
}
