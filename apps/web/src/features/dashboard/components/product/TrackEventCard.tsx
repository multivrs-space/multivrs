import { CopyButton } from "@/components/CopyButton";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { LivePointerClick } from "@/components/icons/animated";
import { cn } from "@/lib/utils";

/** Works on any Multivrs project with Web Analytics on, before or after the script loads. */
export const TRACK_SNIPPET = `function track(name, properties) {
  const event = { name, properties };
  if (window.__multivrsAnalytics) window.__multivrsAnalytics.track(event);
  else (window.multivrsAnalyticsQueue ??= []).push(["event", event]);
}

track("Signed up", { plan: "pro" });`;

/** How to send an event: a few lines of plain JavaScript, copyable. */
export function TrackEventCard({ className }: { className?: string }) {
  return (
    <DashCard aria-label="Track an event" className={className}>
      <DashCardHeader
        description="On any page of a Multivrs project with Web Analytics on"
        icon={LivePointerClick}
        title="Track an event"
      />
      <div className="relative m-2 mt-4 flex-1">
        <pre
          className={cn(
            "surface-inset h-full overflow-x-auto rounded-tile p-4 pr-10 font-geist-mono text-[11.5px] leading-relaxed text-foreground/90",
          )}
        >
          {TRACK_SNIPPET}
        </pre>
        <CopyButton
          className="absolute right-2 top-2 size-7"
          text={TRACK_SNIPPET}
        />
      </div>
      <p className="px-5 pb-4 text-[11.5px] text-muted-foreground">
        Name events for what the person did: “Signed up”, “Started checkout”.
        Properties are optional.
      </p>
    </DashCard>
  );
}
