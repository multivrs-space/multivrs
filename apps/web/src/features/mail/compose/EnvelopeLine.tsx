import type { ReactNode } from "react";

/** A borderless field that fills an envelope line. */
export const ENVELOPE_FIELD =
  "h-10 min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground/60";

/** An envelope line: label on the left, the field filling the rest. */
export function EnvelopeLine({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5">
      <label
        className="w-16 shrink-0 text-[12.5px] text-muted-foreground"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
