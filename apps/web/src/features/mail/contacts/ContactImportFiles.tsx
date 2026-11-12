"use client";

import { type DragEvent, useState } from "react";
import { LiveFileText, LiveFileUp, LiveX } from "@/components/icons/animated";
import type { CsvFileSummary } from "@/features/mail/contacts/contact-merge";
import { cn } from "@/lib/utils";

const count = new Intl.NumberFormat("en-US");

/** Drop or pick any number of CSV exports; each is listed with what it holds. */
export function ContactImportFiles({
  files,
  onAdd,
  onRemove,
}: {
  files: CsvFileSummary[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const [over, setOver] = useState(false);
  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    onAdd([...event.dataTransfer.files]);
  };
  return (
    <div className="space-y-2">
      <label
        className={cn(
          "surface-inset flex cursor-pointer flex-col items-center gap-2 rounded-tile border border-dashed border-hairline-strong px-4 text-center transition-colors focus-within:ring-2 focus-within:ring-ring/50 hover:bg-foreground/[0.03]",
          files.length ? "py-4" : "py-8",
          over && "border-primary bg-primary/5",
        )}
        data-icon-trigger
        onDragLeave={() => setOver(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDrop={drop}
      >
        <LiveFileUp
          className="size-5 text-muted-foreground"
          strokeWidth={1.75}
        />
        <span className="text-[13px] font-medium text-foreground">
          {files.length
            ? "Add another file"
            : "Drop CSV files here, or choose them"}
        </span>
        <span className="text-[12px] text-muted-foreground">
          Add as many as you like; they're merged and duplicates removed.
        </span>
        <input
          accept=".csv,text/csv"
          className="sr-only"
          multiple
          onChange={(event) => {
            onAdd([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
          type="file"
        />
      </label>
      {files.length ? (
        <ul className="space-y-1" aria-label="Files to import">
          {files.map((file, index) => (
            <li
              className="flex items-center gap-3 rounded-tile px-2 py-1.5 hover:bg-foreground/[0.03]"
              key={file.key}
            >
              <LiveFileText
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-foreground">
                  {file.name}
                </p>
                <p
                  className={cn(
                    "text-[11.5px]",
                    file.unreadable
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {file.unreadable
                    ? "No email column found"
                    : `${count.format(file.contacts)} contacts${
                        file.invalid
                          ? ` · ${count.format(file.invalid)} without a valid email`
                          : ""
                      }`}
                </p>
              </div>
              <button
                aria-label={`Remove ${file.name}`}
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                data-icon-trigger
                onClick={() => onRemove(index)}
                type="button"
              >
                <LiveX className="size-3.5" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
