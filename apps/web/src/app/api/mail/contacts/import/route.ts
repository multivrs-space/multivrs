import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { importMailContactsSchema } from "@/lib/schemas/mail-resource.schemas";
import { importContacts } from "@/lib/services/mail-contact-import.service";

/** A batch of contacts from uploaded CSV files. */
export async function POST(request: Request) {
  try {
    return ok(
      await importContacts(
        await requireUserId(),
        await parseBody(request, importMailContactsSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
