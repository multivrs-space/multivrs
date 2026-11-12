import type { Metadata } from "next";
import { unsubscribeSubject } from "@/lib/services/mail-unsubscribe.service";

/** Read per visit: the contact's status changes when they click. */
export const instant = false;

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/** "a•••@example.com": enough to recognise, not enough to harvest. */
function masked(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 2))}@${domain}`;
}

/**
 * Where someone lands from the unsubscribe link in a broadcast. Opening it
 * changes nothing (link scanners open links); the button does.
 */
export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const [{ token }, { done }] = await Promise.all([params, searchParams]);
  const subject = await unsubscribeSubject(token);
  const finished = Boolean(subject && (done || subject.unsubscribed));

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-16 font-hanken text-foreground">
      <div className="surface-card w-full max-w-[420px] rounded-[22px] border border-hairline p-7 text-center">
        {!subject ? (
          <>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
              This link isn't valid
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              It may be incomplete. Open the unsubscribe link from the email
              again.
            </p>
          </>
        ) : finished ? (
          <>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
              You're unsubscribed
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {masked(subject.email)} won't get broadcasts from {subject.sender}{" "}
              anymore.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
              Unsubscribe from {subject.sender}?
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {masked(subject.email)} will stop getting their broadcasts. Emails
              you exchange with them directly aren't affected.
            </p>
            <form action={`/api/mail/unsubscribe/${token}`} method="post">
              <input name="source" type="hidden" value="page" />
              <button
                className="surface-hero surface-press mt-6 h-10 w-full rounded-full text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="submit"
              >
                Unsubscribe
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
