"use client";

import { useEffect, useEffectEvent } from "react";

interface MailShortcuts {
  next: () => void;
  previous: () => void;
  /** Omitted while there's nothing to reply to. */
  reply?: () => void;
  archive?: () => void;
}

/** J/K to move, R to reply, E to archive, ignored while typing. */
export function useMailShortcuts(shortcuts: MailShortcuts) {
  // An effect event reads the latest handlers without re-subscribing.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const active = document.activeElement as HTMLElement | null;
    const tag = active?.tagName.toLowerCase();
    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      active?.isContentEditable
    )
      return;
    const key = event.key.toLowerCase();
    const handler =
      key === "j"
        ? shortcuts.next
        : key === "k"
          ? shortcuts.previous
          : key === "r"
            ? shortcuts.reply
            : key === "e"
              ? shortcuts.archive
              : undefined;
    if (!handler) return;
    event.preventDefault();
    handler();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}
