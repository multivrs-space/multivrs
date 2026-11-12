import { DashCard } from "@/components/dashboard/DashCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { AnimatedIcon } from "@/components/icons/animated";

/**
 * An Observe product that isn't collecting yet: what it will do and how
 * anything, hosted here or elsewhere, will connect to it. No sample data.
 */
export function ObservePlanned({
  glyph,
  title,
  summary,
  features,
  connect,
}: {
  glyph: AnimatedIcon;
  title: string;
  summary: string;
  features: string[];
  /** How sources plug in, one line each. */
  connect: string[];
}) {
  return (
    <DashCard>
      <EmptyState
        description={
          <>
            <p>{summary}</p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
              {[
                ["What you'll get", features],
                ["How it connects", connect],
              ].map(([heading, lines]) => (
                <div
                  className="surface-inset rounded-tile p-4"
                  key={String(heading)}
                >
                  <p className="font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                    {heading}
                  </p>
                  <ul className="mt-2.5 space-y-2 text-[12.5px]">
                    {(lines as string[]).map((line) => (
                      <li className="flex gap-2" key={line}>
                        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        }
        glyph={glyph}
        title={`${title} is coming`}
      />
    </DashCard>
  );
}
