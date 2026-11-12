"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/components/dashboard/lib/units";
import { LivePaperclip, LiveX } from "@/components/icons/animated";

export function MailAttachmentPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function choose(next: FileList | null) {
    const selected = Array.from(next ?? []).slice(0, 5);
    setFiles(selected);
  }

  function remove(index: number) {
    const next = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(next);
    if (inputRef.current) {
      const transfer = new DataTransfer();
      next.forEach((file) => {
        transfer.items.add(file);
      });
      inputRef.current.files = transfer.files;
    }
  }

  return (
    <div>
      <label
        className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full px-3 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        data-icon-trigger
      >
        <LivePaperclip className="size-3.5" strokeWidth={1.75} /> Attach files
        <input
          className="sr-only"
          multiple
          name="attachments"
          onChange={(event) => choose(event.target.files)}
          ref={inputRef}
          type="file"
        />
      </label>
      {files.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              className="surface-raised flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-[11.5px] text-foreground"
              key={`${file.name}-${file.lastModified}`}
            >
              <span className="max-w-48 truncate">{file.name}</span>
              <span className="font-geist-mono text-[10px] text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <button
                aria-label={`Remove ${file.name}`}
                className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                data-icon-trigger
                onClick={() => remove(index)}
                type="button"
              >
                <LiveX className="size-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
