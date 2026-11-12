import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { AnimatedIcon } from "@/components/icons/animated";

interface PlannedSignalViewProps {
  title: string;
  description: string;
  glyph: AnimatedIcon;
  tracks: string[];
}

/** A view whose signals aren't collected yet: say plainly what it will show. */
export function PlannedSignalView({
  title,
  description,
  glyph,
  tracks,
}: PlannedSignalViewProps) {
  return (
    <DashCard>
      <EmptyState
        description={
          <>
            <p>
              {description} This view lights up once its signals start flowing.
            </p>
            <ul className="mx-auto mt-4 w-fit space-y-1.5 text-left">
              {tracks.map((track) => (
                <li className="flex items-center gap-2" key={track}>
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  {track}
                </li>
              ))}
            </ul>
          </>
        }
        glyph={glyph}
        title={`${title} isn't collecting yet`}
      />
    </DashCard>
  );
}
