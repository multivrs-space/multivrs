import { LiveMail } from "@/components/icons/animated";
import { Object3DSlot } from "@/features/dashboard/three/Object3DSlot";
import { cn } from "@/lib/utils";

const KEYS = [
  { keys: ["J", "K"], label: "move" },
  { keys: ["R"], label: "reply" },
  { keys: ["E"], label: "archive" },
];

/** The reading pane before a conversation is chosen: the mail tile and keys. */
export function MailReaderEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative hidden h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-8 text-center md:flex",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <Object3DSlot
        className="relative size-36"
        label="Mail illustration"
        parts={LiveMail.parts}
      >
        <span className="surface-raised grid size-20 place-items-center rounded-[22px] text-muted-foreground">
          <LiveMail className="size-9" strokeWidth={1.5} />
        </span>
      </Object3DSlot>
      <h3 className="relative mt-4 text-[17px] font-semibold tracking-[-0.02em] text-foreground">
        Pick a conversation
      </h3>
      <p className="relative mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        Messages open here, with every reply in the thread.
      </p>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11.5px] text-muted-foreground">
        {KEYS.map((item) => (
          <span className="flex items-center gap-1.5" key={item.label}>
            {item.keys.map((key) => (
              <kbd
                className="surface-raised grid min-w-5 place-items-center rounded-md px-1 py-0.5 font-geist-mono text-[10.5px] text-foreground"
                key={key}
              >
                {key}
              </kbd>
            ))}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
