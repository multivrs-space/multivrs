import type { MailThreadSummary } from "@/features/mail/mail.types";

export interface ThreadGroup {
  label: string;
  threads: MailThreadSummary[];
}

const DAY_MS = 86_400_000;

/** Today, Yesterday, This week, then one group per month, newest first. */
export function groupThreads(
  threads: readonly MailThreadSummary[],
  now = new Date(),
): ThreadGroup[] {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const groups: ThreadGroup[] = [];
  for (const thread of threads) {
    const label = groupLabel(new Date(thread.lastMessageAt), today, now);
    const last = groups.at(-1);
    if (last?.label === label) last.threads.push(thread);
    else groups.push({ label, threads: [thread] });
  }
  return groups;
}

function groupLabel(date: Date, today: number, now: Date): string {
  const time = date.getTime();
  if (Number.isNaN(time)) return "Earlier";
  if (time >= today) return "Today";
  if (time >= today - DAY_MS) return "Yesterday";
  if (time >= today - 6 * DAY_MS) return "This week";
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(
    "en-US",
    sameYear ? { month: "long" } : { month: "long", year: "numeric" },
  );
}

/** A time for today, a date for this year, a short date before that. */
export function threadTime(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}
