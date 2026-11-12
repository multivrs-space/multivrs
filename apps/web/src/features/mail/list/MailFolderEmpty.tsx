import type { AnimatedIcon } from "@/components/icons/animated";

/** An empty folder: its own icon and a line about what lands there. */
export function MailFolderEmpty({
  icon: Icon,
  title,
}: {
  icon: AnimatedIcon | null;
  title: string;
}) {
  return (
    <div
      className="flex flex-col items-center px-6 py-16 text-center"
      data-icon-trigger
    >
      <span className="surface-inset grid size-11 place-items-center rounded-tile text-muted-foreground">
        {Icon ? <Icon className="size-5" strokeWidth={1.5} /> : null}
      </span>
      <p className="mt-3 text-[13px] font-medium text-foreground">
        Nothing in {title.toLowerCase()}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        New conversations show up here as they arrive.
      </p>
    </div>
  );
}
