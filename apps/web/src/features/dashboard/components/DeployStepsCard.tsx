import { Globe2, Hammer, ScanSearch } from "lucide-react";

const STEPS = [
  {
    icon: ScanSearch,
    title: "Detect",
    body: "We read the repository and pick the framework, package manager and build command.",
  },
  {
    icon: Hammer,
    title: "Build",
    body: "Each deployment builds in its own isolated environment. Logs stream as it runs.",
  },
  {
    icon: Globe2,
    title: "Go live",
    body: "Your project gets a URL on multivrs.app, and every push to the branch redeploys it.",
  },
] as const;

export function DeployStepsCard() {
  return (
    <section className="rounded-xl border border-(--hairline) p-4">
      <h2 className="text-sm font-semibold">What happens next</h2>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="relative grid size-7 shrink-0 place-items-center rounded-md border border-(--hairline) bg-foreground/[0.03]">
              <step.icon className="size-3.5 text-primary" />
              <span className="sr-only">Step {index + 1}</span>
            </span>
            <div>
              <p className="text-[13px] font-medium">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
