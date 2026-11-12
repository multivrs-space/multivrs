"use client";

import type { RefObject } from "react";

/**
 * Personalisation tags as chips; a click writes the tag where the cursor is,
 * with a fallback for contacts who don't have that value.
 */
export function MergeTags({
  properties,
  target,
}: {
  properties: string[];
  target: RefObject<HTMLTextAreaElement | null>;
}) {
  const tags = ["first_name", "last_name", "email", ...properties];
  function insert(tag: string) {
    const field = target.current;
    if (!field) return;
    const text = tag === "first_name" ? "{{first_name|there}}" : `{{${tag}}}`;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.setRangeText(text, start, end, "end");
    field.focus();
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11.5px] text-muted-foreground">
        Personalise
      </span>
      {tags.map((tag) => (
        <button
          className="rounded-full border border-hairline px-2 py-0.5 font-geist-mono text-[11px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          key={tag}
          onClick={() => insert(tag)}
          type="button"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
