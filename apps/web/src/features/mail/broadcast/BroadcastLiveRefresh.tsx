"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** While a broadcast is going out, its numbers refresh every second or two. */
export function BroadcastLiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 1_500);
    return () => window.clearInterval(timer);
  }, [active, router]);
  return null;
}
