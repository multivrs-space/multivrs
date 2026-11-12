"use client";

import { useState } from "react";
import { toast } from "sonner";

type ActionResult = { error?: { message?: string } | null };

/** Runs one team action at a time, toasting the outcome and reloading after. */
export function useMemberAction(reload: () => Promise<unknown>) {
  const [busy, setBusy] = useState<string | null>(null);
  async function act(
    key: string,
    work: () => Promise<ActionResult>,
    done: string,
  ) {
    setBusy(key);
    try {
      const result = await work();
      if (result.error)
        return void toast.error(result.error.message ?? "That didn't work.");
      toast.success(done);
      await reload();
    } catch {
      toast.error("That didn't work.");
    } finally {
      setBusy(null);
    }
  }
  return { busy, act };
}
