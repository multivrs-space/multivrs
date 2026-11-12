import type { ReactNode } from "react";
import type { AnimatedIcon } from "@/components/icons/animated";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** The opening of every dashboard dialog: a raised icon, a title, one line. */
export function DashDialogHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: AnimatedIcon;
  title: string;
  description?: ReactNode;
}) {
  return (
    <DialogHeader className="gap-3 text-left">
      <span
        className="surface-raised grid size-10 place-items-center rounded-tile text-primary"
        data-icon-trigger
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <DialogTitle className="text-lg font-semibold tracking-[-0.02em]">
        {title}
      </DialogTitle>
      {description ? (
        <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </DialogDescription>
      ) : null}
    </DialogHeader>
  );
}
