import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import {
  type AnimatedIcon,
  LiveGitBranch,
  LiveGlobe,
  LiveRocket,
  LiveSearchCode,
  LiveSquareTerminal,
} from "@/components/icons/animated";

const STEPS: { icon: AnimatedIcon; title: string; body: string }[] = [
  {
    icon: LiveSearchCode,
    title: "Read",
    body: "Multivrs looks at the repository and picks the framework, package manager and build command.",
  },
  {
    icon: LiveSquareTerminal,
    title: "Build",
    body: "The build runs on its own machine, and every line shows up as it happens.",
  },
  {
    icon: LiveGlobe,
    title: "Go live",
    body: "The project gets its own address. You can add a domain whenever you like.",
  },
  {
    icon: LiveGitBranch,
    title: "Keep shipping",
    body: "Pushes to the default branch go to production; other branches and pull requests get previews.",
  },
];

/** What happens after Import, as a short vertical timeline. */
export function DeployStepsCard() {
  return (
    <DashCard aria-label="How it ships">
      <DashCardHeader icon={LiveRocket} title="How it ships" />
      <ol className="relative p-5 pt-4">
        {STEPS.map((step, index) => (
          <li
            className="relative flex gap-3 pb-4 last:pb-0"
            data-icon-trigger
            key={step.title}
          >
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-8 bottom-0 left-[13.5px] w-px bg-hairline"
              />
            ) : null}
            <span className="surface-raised relative grid size-7 shrink-0 place-items-center rounded-[8px] text-primary">
              <step.icon className="size-3.5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                <span className="mr-1.5 font-geist-mono text-[11px] font-normal text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </DashCard>
  );
}
