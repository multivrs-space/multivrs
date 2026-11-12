"use client";

import { cn } from "@/lib/utils";

/**
 * Other columns in the files, offered as properties to keep. None are kept
 * unless chosen; columns holding secrets are never offered.
 */
export function ContactImportColumns({
  columns,
  keep,
  onChange,
}: {
  columns: { key: string; header: string }[];
  keep: string[];
  onChange: (keep: string[]) => void;
}) {
  if (!columns.length) return null;
  return (
    <fieldset className="space-y-2">
      <legend className="text-[12px] font-medium text-muted-foreground">
        Keep other columns as properties (optional)
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {columns.map((column) => {
          const kept = keep.includes(column.key);
          return (
            <button
              aria-pressed={kept}
              className={cn(
                "rounded-full border px-2.5 py-1 font-geist-mono text-[11.5px] transition-colors",
                kept
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-hairline text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
              key={column.key}
              onClick={() =>
                onChange(
                  kept
                    ? keep.filter((key) => key !== column.key)
                    : [...keep, column.key],
                )
              }
              title={column.header}
              type="button"
            >
              {column.key}
            </button>
          );
        })}
      </div>
      <p className="text-[11.5px] text-muted-foreground">
        Kept columns become merge tags, like {"{{company}}"}, in broadcasts.
      </p>
    </fieldset>
  );
}
