"use client";

import { FRAMEWORK_IDS, type FrameworkId } from "@multivrs/config";
import { CircleAlert, Loader2, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import type { DetectionState } from "@/features/dashboard/hooks/useFrameworkDetection";

export function FrameworkField({
  detection,
  onChange,
  value,
}: {
  detection: DetectionState;
  onChange: (framework: FrameworkId) => void;
  value: FrameworkId;
}) {
  const detected =
    detection.status === "detected" ? detection.result.framework : null;
  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      <span>Framework</span>
      <Select
        value={value}
        disabled={detection.status === "detecting"}
        onValueChange={(next) => {
          const framework = FRAMEWORK_IDS.find((id) => id === next);
          if (framework) onChange(framework);
        }}
      >
        <SelectTrigger className="h-9 w-full border-(--hairline) bg-foreground/[0.03] text-[13px] text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FRAMEWORK_IDS.map((id) => (
            <SelectItem key={id} value={id}>
              {FRAMEWORK_LABELS[id]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="flex items-center gap-1.5 text-[11px]" aria-live="polite">
        {detection.status === "detecting" ? (
          <>
            <Loader2 className="size-3 animate-spin" /> Reading the repository…
          </>
        ) : detection.status === "failed" ? (
          <>
            <CircleAlert className="size-3 text-amber-400" />
            Couldn’t read the repository. Choose the framework yourself.
          </>
        ) : detected === null ? (
          <>
            <CircleAlert className="size-3 text-amber-400" />
            No framework found. It will deploy as a static site.
          </>
        ) : detected === value ? (
          <>
            <Sparkles className="size-3 text-primary" />
            Detected {FRAMEWORK_LABELS[detected]} ·{" "}
            {detection.result.packageManager}
          </>
        ) : (
          <>
            Overriding detected {FRAMEWORK_LABELS[detected]}.{" "}
            <button
              type="button"
              onClick={() => onChange(detected)}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Reset
            </button>
          </>
        )}
      </p>
    </div>
  );
}
