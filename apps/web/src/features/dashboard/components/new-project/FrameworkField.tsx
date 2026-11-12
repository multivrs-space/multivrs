"use client";

import { FRAMEWORK_IDS, type FrameworkId } from "@multivrs/config";
import {
  DASH_FIELD,
  DASH_MENU,
  DASH_MENU_ITEM,
} from "@/components/dashboard/menu";
import { Spinner } from "@/components/dashboard/Spinner";
import { LiveSparkles, LiveTriangleAlert } from "@/components/icons/animated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FrameworkLogo } from "@/features/dashboard/components/new-project/FrameworkLogo";
import { FRAMEWORK_LABELS } from "@/features/dashboard/constants/framework-labels";
import type { DetectionState } from "@/features/dashboard/hooks/useFrameworkDetection";
import { cn } from "@/lib/utils";

export function FrameworkField({
  detection,
  disabled = false,
  onChange,
  value,
}: {
  detection: DetectionState;
  disabled?: boolean;
  onChange: (framework: FrameworkId) => void;
  value: FrameworkId;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-muted-foreground">
        Framework
      </span>
      <Select
        disabled={disabled || detection.status === "detecting"}
        onValueChange={(next) => {
          const framework = FRAMEWORK_IDS.find((id) => id === next);
          if (framework) onChange(framework);
        }}
        value={value}
      >
        <SelectTrigger
          aria-label="Framework"
          className={cn(DASH_FIELD, "h-10 w-full gap-2")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={DASH_MENU}>
          {FRAMEWORK_IDS.map((id) => (
            <SelectItem className={DASH_MENU_ITEM} key={id} value={id}>
              <span className="inline-flex items-center gap-2 align-middle">
                <FrameworkLogo framework={id} />
                {FRAMEWORK_LABELS[id]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p
        aria-live="polite"
        className="flex min-h-4 items-center gap-1.5 text-[11.5px] text-muted-foreground"
      >
        <DetectionNote detection={detection} onUse={onChange} value={value} />
      </p>
    </div>
  );
}

function DetectionNote({
  detection,
  onUse,
  value,
}: {
  detection: DetectionState;
  onUse: (framework: FrameworkId) => void;
  value: FrameworkId;
}) {
  const warning = (
    <LiveTriangleAlert
      className="size-3 shrink-0 text-amber-600 dark:text-amber-400"
      strokeWidth={2}
    />
  );
  if (detection.status === "detecting")
    return (
      <>
        <Spinner className="size-3" /> Reading the repository…
      </>
    );
  if (detection.status === "failed")
    return (
      <>
        {warning} Couldn't read the repository. Choose the framework yourself.
      </>
    );
  const detected = detection.result.framework;
  if (detected === null)
    return <>{warning} No framework found, so it deploys as a static site.</>;
  if (detected === value)
    return (
      <>
        <LiveSparkles
          className="size-3 shrink-0 text-primary"
          strokeWidth={2}
        />
        Detected from the repository · {detection.result.packageManager}
      </>
    );
  return (
    <>
      The repository looks like {FRAMEWORK_LABELS[detected]}.
      <button
        className="font-medium text-foreground underline-offset-4 hover:underline"
        onClick={() => onUse(detected)}
        type="button"
      >
        Use it
      </button>
    </>
  );
}
