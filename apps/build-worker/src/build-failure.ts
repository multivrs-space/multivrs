// biome-ignore lint/suspicious/noControlCharactersInRegex: terminal colour codes start with ESC; matching it is the point
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const ERROR_LINE = /\b(error|failed|cannot|could not|not found|missing|exception|ERR!)\b/i;
const NOISE = /\b0 errors?\b|^\s*at\s/i;
const TAIL_CHARS = 8_000;

/** Keep only the end of the build output: enough to explain a failure. */
export function appendTail(tail: string, chunk: string): string {
  const next = tail + chunk;
  return next.length > TAIL_CHARS ? next.slice(-TAIL_CHARS) : next;
}

/**
 * The line that best explains a failed build: the last one that reads like
 * an error, or else the last thing printed. Plain text, one line, short.
 */
export function failureReason(tail: string): string | null {
  const lines = tail
    .replace(ANSI, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const reason =
    [...lines].reverse().find((line) => ERROR_LINE.test(line) && !NOISE.test(line)) ?? lines.at(-1);
  return reason ? reason.slice(0, 300) : null;
}

/** "Building with Next.js failed: Cannot find module 'x'", or the exit code if nothing explains it. */
export function buildFailureMessage(exitCode: number | undefined, tail: string): string {
  const reason = failureReason(tail)?.replace(/^Error:\s*/, "");
  return reason ?? `Build failed (exit code ${exitCode ?? "unknown"}).`;
}
