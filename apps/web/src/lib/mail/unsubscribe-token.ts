import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsubscribe links in broadcasts. The token names the contact and is
 * signed, so a link can't be edited to unsubscribe someone else.
 */

function signingKey(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  return `mail-unsubscribe:${secret}`;
}

function signature(contactId: string): string {
  return createHmac("sha256", signingKey())
    .update(contactId)
    .digest("base64url")
    .slice(0, 32);
}

export function unsubscribeToken(contactId: string): string {
  return `${contactId}.${signature(contactId)}`;
}

/** The contact a token is for, or null when it was altered. */
export function contactFromToken(token: string): string | null {
  const [contactId, given] = token.split(".");
  if (!contactId || !given) return null;
  const expected = Buffer.from(signature(contactId));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual)
    ? contactId
    : null;
}

/**
 * Links in mail always point at the live site, even when the send started
 * from a development machine.
 */
const MAIL_LINK_BASE =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
    : "https://multivrs.space";

export function unsubscribeLinks(contactId: string) {
  const token = unsubscribeToken(contactId);
  return {
    /** Where people land from the link in the email. */
    page: `${MAIL_LINK_BASE}/unsubscribe/${token}`,
    /** What mail apps call for their own unsubscribe button. */
    oneClick: `${MAIL_LINK_BASE}/api/mail/unsubscribe/${token}`,
  };
}
