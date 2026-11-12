"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LiveCopy } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "grid place-items-center rounded-full p-1.5 text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        copied &&
          "text-emerald-600 hover:text-emerald-600 dark:text-emerald-400",
        className,
      )}
      data-icon-trigger
    >
      {copied ? (
        <Check className="size-3.5 duration-200 animate-in zoom-in-50" />
      ) : (
        <LiveCopy className="size-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
