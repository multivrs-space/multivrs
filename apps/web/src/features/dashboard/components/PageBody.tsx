import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The padded, width-capped column every dashboard page sits in. */
export function PageBody({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Full canvas width for data-dense pages such as logs. */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-5 px-4 py-5 lg:px-6 lg:py-6",
        wide ? "max-w-none" : "max-w-[1440px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
