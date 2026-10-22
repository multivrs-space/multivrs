import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createSubscriptionCheckout } from "@/lib/services/subscription-checkout.service";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    let body: {
      organizationId?: string;
      returnSlug?: string;
      addOns?: ("developer_seat" | "mail_volume" | "observability_plus")[];
    } = {};
    try {
      body = (await request.json()) as {
        organizationId?: string;
        returnSlug?: string;
        addOns?: ("developer_seat" | "mail_volume" | "observability_plus")[];
      };
    } catch {
      // Body is optional
    }
    return ok(
      await createSubscriptionCheckout(userId, {
        organizationId: body.organizationId,
        returnSlug: body.returnSlug,
        addOns: body.addOns,
      }),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
