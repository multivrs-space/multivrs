/**
 * The four steps every build goes through, read from the lines the build
 * prints. Nothing is estimated: a step is done when its own "finished" line
 * arrives, and its time is the one the build reported.
 */

export type BuildPhaseId = "machine" | "install" | "build" | "deploy";
export type BuildPhaseState =
  | "waiting"
  | "running"
  | "done"
  | "skipped"
  | "failed";

export interface BuildPhase {
  id: BuildPhaseId;
  label: string;
  state: BuildPhaseState;
  /** Reported duration, e.g. "2.7s", once the step finishes. */
  duration: string | null;
  /** When the step's first line arrived, for a ticking clock while it runs. */
  startedAt: string | null;
}

/** A log line; with `createdAt`, a running step can show how long it has run. */
export type BuildLine = string | { message: string; createdAt?: string };

interface PhaseMarkers {
  id: BuildPhaseId;
  label: string;
  starts: readonly string[];
  /** The line that closes the step; its tail holds the duration. */
  done: string;
}

const PHASES: readonly PhaseMarkers[] = [
  {
    id: "machine",
    label: "Set up",
    starts: [
      "Starting build environment",
      "Machine started",
      "Cloning repository",
    ],
    done: "Build machine ready in ",
  },
  {
    id: "install",
    label: "Install",
    starts: ["Installing dependencies"],
    done: "Installed dependencies in ",
  },
  {
    id: "build",
    label: "Build",
    starts: ["Building with ", "Running build command: ", "Preparing Next.js"],
    done: "Built in ",
  },
  {
    id: "deploy",
    label: "Deploy",
    starts: ["Optimized ", "Uploading "],
    done: "Uploaded in ",
  },
];

const SERVER_START = "Publishing the server";
const SERVER_DONE = "Server published";

/** "Uploaded in 0.8s · ready in 12s" → "0.8s". */
function durationAfter(line: string, prefix: string): string {
  return line.slice(prefix.length).split(" ·")[0]?.trim() ?? "";
}

export function buildPhases(
  input: readonly BuildLine[],
  status: string,
): BuildPhase[] {
  const entries = input.map((line) =>
    typeof line === "string"
      ? { text: line.trim(), at: null }
      : { text: line.message.trim(), at: line.createdAt ?? null },
  );
  const has = (prefix: string) =>
    entries.some((entry) => entry.text.startsWith(prefix));
  const found = PHASES.map((phase) => {
    const doneLine = entries.find((entry) => entry.text.startsWith(phase.done));
    const first = entries.find((entry) =>
      phase.starts.some((prefix) => entry.text.startsWith(prefix)),
    );
    return {
      reached: first !== undefined || doneLine !== undefined,
      startedAt: first?.at ?? null,
      duration: doneLine ? durationAfter(doneLine.text, phase.done) : null,
    };
  });
  // A server app publishes after the upload; the deploy step waits for it.
  const deploy = found[3];
  if (deploy && has(SERVER_START) && !has(SERVER_DONE)) deploy.duration = null;

  const furthest = found.reduce(
    (last, phase, index) => (phase.reached ? index : last),
    0,
  );
  // Once the furthest step has finished, the build is in the one after it.
  const active =
    found[furthest]?.duration && furthest < PHASES.length - 1
      ? furthest + 1
      : furthest;
  const settled = status !== "queued" && status !== "building";
  const known = found.some((entry) => entry.reached);
  // A step with no line of its own yet began when the last line arrived.
  const lastAt = [...entries].reverse().find((entry) => entry.at)?.at ?? null;
  return PHASES.map((phase, index): BuildPhase => {
    const step = found[index];
    const reached = step?.reached ?? false;
    const base = {
      id: phase.id,
      label: phase.label,
      duration: step?.duration ?? null,
      startedAt: step?.startedAt ?? (index === active ? lastAt : null),
    };
    if (status === "ready") {
      // Older builds printed none of these lines; they still finished.
      return {
        ...base,
        state: reached || index > furthest || !known ? "done" : "skipped",
      };
    }
    if (index < active) return { ...base, state: reached ? "done" : "skipped" };
    if (index > active) return { ...base, state: "waiting" };
    return { ...base, state: settled ? "failed" : "running" };
  });
}

/** The step a running build is in, for headings like "Installing…". */
export function currentPhase(phases: readonly BuildPhase[]): BuildPhase | null {
  return (
    phases.find(
      (phase) => phase.state === "running" || phase.state === "failed",
    ) ?? null
  );
}
