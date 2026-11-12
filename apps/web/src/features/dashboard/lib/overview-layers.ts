import {
  formatCompact,
  formatPercent,
} from "@/components/dashboard/lib/format";
import { formatBytes } from "@/components/dashboard/lib/units";
import type { OrbTone } from "@/components/dashboard/StatusOrb";
import {
  type AnimatedIcon,
  LiveAtSign,
  LiveGlobe,
  LiveLayoutGrid,
  LiveNetwork,
} from "@/components/icons/animated";
import type { WorkspaceNumbers } from "@/features/dashboard/lib/overview-tiles";
import { deliveryRate, totalActivity } from "@/features/mail/lib/mail-metrics";

export interface Layer {
  name: string;
  icon: AnimatedIcon;
  href: string;
  state: string;
  tone: OrbTone;
  detail: string;
}

/** One row per layer of the stack: what's running and what needs attention. */
export function stackLayers({
  username,
  projects,
  domains,
  mail,
  usage,
}: Omit<WorkspaceNumbers, "deploys"> & {
  domains: { status: string }[];
}): Layer[] {
  const base = `/${username}/~`;
  const live = projects.filter((project) => project.status === "ready").length;
  const failing = projects.filter(
    (project) => project.status === "error",
  ).length;
  const pending = domains.filter((domain) => domain.status !== "Active").length;
  const sent = mail ? totalActivity(mail) : null;
  const delivered = sent ? deliveryRate(sent) : null;
  const layers: Layer[] = [
    {
      name: "Hosting",
      icon: LiveLayoutGrid,
      href: `${base}/projects`,
      state: failing
        ? `${failing} failed`
        : projects.length
          ? "Running"
          : "Empty",
      tone: failing ? "error" : live ? "ready" : "idle",
      detail: `${live}/${projects.length} live`,
    },
    {
      name: "Domains",
      icon: LiveGlobe,
      href: `${base}/domains`,
      state: pending
        ? `${pending} pending`
        : domains.length
          ? "All active"
          : "None yet",
      tone: pending ? "building" : domains.length ? "ready" : "idle",
      detail: `${domains.length} connected`,
    },
    {
      name: "Email",
      icon: LiveAtSign,
      href: `${base}/emails?view=overview`,
      state: !mail ? "No access" : sent?.sent ? "Sending" : "Quiet",
      tone: sent?.sent ? "ready" : "idle",
      detail:
        delivered === null
          ? `${formatCompact(sent?.sent ?? 0)} sent`
          : `${formatPercent(delivered, 1)} delivered`,
    },
    {
      name: "Edge",
      icon: LiveNetwork,
      href: `${base}/projects?view=usage`,
      state:
        usage.state === "ready"
          ? `${usage.averageLatency} ms avg`
          : "Not measured",
      tone: usage.state === "ready" && usage.requests ? "ready" : "idle",
      detail:
        usage.state === "ready"
          ? `${formatBytes(usage.bandwidthBytes)} served`
          : "—",
    },
  ];
  return layers;
}
