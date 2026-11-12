/**
 * The Message-ID other mail clients see for a message. The delivery provider
 * assigns its own to everything we send (it can't be set), built from the
 * provider's message id; received mail keeps the sender's.
 */
const SES_REGION = process.env.AWS_REGION || "us-east-1";
const SES_DOMAIN =
  SES_REGION === "us-east-1"
    ? "email.amazonses.com"
    : `${SES_REGION}.amazonses.com`;

export function publicMessageId(message: {
  direction: string;
  messageId: string;
  providerMessageId: string | null;
}): string {
  return message.direction === "outbound" && message.providerMessageId
    ? `<${message.providerMessageId}@${SES_DOMAIN}>`
    : message.messageId;
}

/** Provider message ids named in reply headers, e.g. `<abc@eu-west-1.amazonses.com>`. */
export function providerIdsIn(headers: readonly string[]): string[] {
  return headers.flatMap((value) => {
    const match = /^<?([^@<>\s]+)@(?:[a-z0-9-]+\.)?amazonses\.com>?$/i.exec(
      value.trim(),
    );
    return match?.[1] ? [match[1]] : [];
  });
}
