import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/services/mail-unsubscribe.service";

type Context = { params: Promise<{ token: string }> };

/**
 * One-click unsubscribe (RFC 8058): mail apps POST here from their own
 * Unsubscribe button. The page's confirm button posts here too and is sent
 * back to the page to see it worked.
 */
export async function POST(request: Request, { params }: Context) {
  const { token } = await params;
  const done = await unsubscribeByToken(token);
  const form = await request.formData().catch(() => null);
  if (form?.get("source") === "page") {
    return NextResponse.redirect(
      new URL(`/unsubscribe/${token}${done ? "?done=1" : ""}`, request.url),
      303,
    );
  }
  return NextResponse.json(
    { unsubscribed: done },
    { status: done ? 200 : 404 },
  );
}

/** Opening the address only shows the page; unsubscribing takes a click. */
export async function GET(request: Request, { params }: Context) {
  const { token } = await params;
  return NextResponse.redirect(
    new URL(`/unsubscribe/${token}`, request.url),
    303,
  );
}
