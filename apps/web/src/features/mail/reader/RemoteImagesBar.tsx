import { LiveImage } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";

/** Says remote images were held back, and loads them for this message. */
export function RemoteImagesBar({
  count,
  onLoad,
}: {
  count: number;
  onLoad: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2 text-[12px] text-muted-foreground"
      data-icon-trigger
    >
      <LiveImage className="size-3.5 shrink-0" strokeWidth={1.75} />
      <span className="min-w-0 flex-1">
        {count === 1 ? "1 remote image is" : `${count} remote images are`}{" "}
        hidden, so the sender can't tell you opened this.
      </span>
      <Button
        className="h-7 rounded-full px-3 text-[12px]"
        onClick={onLoad}
        size="sm"
        variant="raised"
      >
        Load images
      </Button>
    </div>
  );
}
