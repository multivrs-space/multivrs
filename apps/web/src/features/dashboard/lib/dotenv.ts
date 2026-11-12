/** Rules for variable names, matching what the API accepts. */
export const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Reads pasted `.env` text into name/value pairs: skips blanks and comments,
 * drops a leading `export`, and unwraps one level of matching quotes.
 * Returns null when the text isn't `.env` shaped, so a normal paste of a
 * single name still lands in the field as typed.
 */
export function parseDotenv(
  text: string,
): { key: string; value: string }[] | null {
  const lines = text.split(/\r?\n/);
  const pairs: { key: string; value: string }[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/.exec(line);
    if (!match?.[1]) return null;
    pairs.push({ key: match[1], value: unquote(match[2] ?? "") });
  }
  return pairs.length ? pairs : null;
}

function unquote(value: string): string {
  const first = value[0];
  if (
    value.length >= 2 &&
    (first === '"' || first === "'") &&
    value.endsWith(first)
  ) {
    const inner = value.slice(1, -1);
    return first === '"' ? inner.replaceAll("\\n", "\n") : inner;
  }
  // An unquoted value ends at an inline comment.
  return value.replace(/\s+#.*$/, "");
}
