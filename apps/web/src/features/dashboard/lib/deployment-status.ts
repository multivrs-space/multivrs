export type DeploymentTone = "ready" | "building" | "error" | "idle";

export interface DeploymentStatusStyle {
  label: string;
  tone: DeploymentTone;
  /** Solid dot colour. */
  dot: string;
  /** Text colour for the label. */
  text: string;
  /** Soft ring used around live dots. */
  ring: string;
}

const STYLES: Record<DeploymentTone, Omit<DeploymentStatusStyle, "label">> = {
  ready: {
    tone: "ready",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "ring-emerald-400/20",
  },
  building: {
    tone: "building",
    dot: "bg-amber-300",
    text: "text-amber-200",
    ring: "ring-amber-300/20",
  },
  error: {
    tone: "error",
    dot: "bg-rose-400",
    text: "text-rose-300",
    ring: "ring-rose-400/20",
  },
  idle: {
    tone: "idle",
    dot: "bg-foreground/30",
    text: "text-muted-foreground",
    ring: "ring-foreground/10",
  },
};

const LABELS: Record<string, [string, DeploymentTone]> = {
  ready: ["Ready", "ready"],
  building: ["Building", "building"],
  queued: ["Queued", "building"],
  error: ["Failed", "error"],
  canceled: ["Canceled", "idle"],
};

/** Display label and colours for a deployment status; unknown values read as idle. */
export function deploymentStatus(
  status: string | null | undefined,
): DeploymentStatusStyle {
  const [label, tone] = (status && LABELS[status]) || ["No deployment", "idle"];
  return { label, ...STYLES[tone] };
}
