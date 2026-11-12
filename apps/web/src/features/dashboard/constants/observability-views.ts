import { type AnimatedIcon, LiveLayoutGrid } from "@/components/icons/animated";
import { OBSERVABILITY_NAVIGATION } from "@/features/dashboard/constants/observability-navigation";

/**
 * What backs each Observability view:
 * - `edge`: live request analytics (requests, latency, errors, paths)
 * - `transfer`: live bytes served from the edge
 * - `usage`: this billing period's metered totals for the workspace
 * - `planned`: no data source yet; the view explains what it will show
 */
export type ObservabilitySource =
  | "overview"
  | "edge"
  | "transfer"
  | "usage"
  | "planned";

export type UsageFormat = "count" | "bytes" | "duration";

export interface ObservabilityViewConfig {
  view: string;
  source: ObservabilitySource;
  description: string;
  /** Usage counters for `usage` views: label, metric key, format. */
  usage?: [label: string, key: string, format: UsageFormat][];
  /** What the view shows once its signals flow, for `planned` views. */
  tracks?: string[];
}

type ViewConfig = Omit<ObservabilityViewConfig, "view">;

const OVERVIEW: ViewConfig = {
  source: "overview",
  description: "Live serving signals and deployment health.",
};

const CONFIG: Record<string, ViewConfig> = {
  overview: OVERVIEW,
  query: {
    source: "planned",
    description: "Ask any question of your request data.",
    tracks: [
      "Filter by path, status, region and device",
      "Group and chart any field",
      "Save a query as a notebook cell",
    ],
  },
  notebooks: {
    source: "planned",
    description: "Saved queries, charts and notes, shared with your team.",
    tracks: [
      "Query, chart and text cells",
      "Shareable links per notebook",
      "Pinned to the project overview",
    ],
  },
  traces: {
    source: "planned",
    description:
      "Follow one request through every service it touches, span by span.",
    tracks: [
      "A waterfall of spans per request, linked from logs and errors",
      "Slowest endpoints and the span that made them slow",
      "OpenTelemetry in, from Multivrs or any other host",
    ],
  },
  functions: {
    source: "usage",
    description: "Serverless function invocations and execution time.",
    usage: [
      ["Invocations", "function_invocations", "count"],
      ["Execution time", "function_duration_ms", "duration"],
    ],
  },
  "agent-runs": {
    source: "usage",
    description: "Durable workflow and agent steps.",
    usage: [
      ["Steps run", "workflow_events", "count"],
      ["Data written", "workflow_data_written_bytes", "bytes"],
      ["Data retained", "workflow_data_retained_bytes", "bytes"],
    ],
  },
  sandboxes: {
    source: "usage",
    description: "Ephemeral sandboxes and the time they ran.",
    usage: [
      ["Created", "sandbox_creations", "count"],
      ["Command time", "sandbox_active_ms", "duration"],
      ["Provisioned time", "sandbox_provisioned_ms", "duration"],
      ["Running now", "concurrent_sandboxes", "count"],
    ],
  },
  "external-apis": {
    source: "planned",
    description: "Calls your functions make to third-party APIs.",
    tracks: [
      "Latency and errors per host",
      "Slowest endpoints",
      "Requests per deployment",
    ],
  },
  middleware: {
    source: "planned",
    description: "Middleware invocations, duration and rewrites.",
    tracks: [
      "Invocations per route",
      "Added latency",
      "Rewrites and redirects taken",
    ],
  },
  "edge-requests": {
    source: "edge",
    description: "Every request served at the edge, by path, status and place.",
  },
  isr: {
    source: "usage",
    description: "Incremental pages read from and written to cache.",
    usage: [
      ["Cache reads", "isr_reads", "count"],
      ["Cache writes", "isr_writes", "count"],
    ],
  },
  "fast-data-transfer": {
    source: "transfer",
    description: "Bytes delivered from the edge to visitors.",
  },
  "image-optimization": {
    source: "usage",
    description: "Images transformed and served from cache.",
    usage: [
      ["Transformations", "image_transformations", "count"],
      ["Cache reads", "image_cache_reads", "count"],
      ["Cache writes", "image_cache_writes", "count"],
    ],
  },
  "external-origins": {
    source: "planned",
    description: "Requests proxied to origins outside Multivrs.",
    tracks: [
      "Latency per origin",
      "Cache hit rate per origin",
      "Origin errors",
    ],
  },
  microfrontends: {
    source: "usage",
    description: "Requests routed across mounted projects.",
    usage: [
      ["Routed requests", "microfrontend_routing", "count"],
      ["Mounts", "microfrontend_mounts", "count"],
    ],
  },
  ai: {
    source: "planned",
    description: "Model calls, tokens and cost from your AI features.",
    tracks: [
      "Calls and tokens per model",
      "Latency and errors per provider",
      "Spend over time",
    ],
  },
  blob: {
    source: "usage",
    description: "Multivrs Blob storage and transfer.",
    usage: [
      ["Stored", "blob_storage_size", "bytes"],
      ["Transferred", "blob_data_transfer", "bytes"],
      ["Simple operations", "blob_simple_operations", "count"],
      ["Advanced operations", "blob_advanced_operations", "count"],
    ],
  },
  queues: {
    source: "planned",
    description: "Messages published, delivered and retried.",
    tracks: [
      "Throughput per topic",
      "Delivery latency",
      "Retries and dead letters",
    ],
  },
};

export interface ResolvedObservabilityView extends ObservabilityViewConfig {
  label: string;
  icon: AnimatedIcon;
}

/** The config for a `?view=` value, falling back to the overview. */
export function observabilityView(
  view: string | undefined,
): ResolvedObservabilityView {
  const config = (view && CONFIG[view]) || OVERVIEW;
  const key = config === OVERVIEW ? "overview" : (view ?? "overview");
  const nav = OBSERVABILITY_NAVIGATION.find(
    (item) => "view" in item && item.view === key,
  );
  const found = nav && "label" in nav ? nav : null;
  return {
    view: key,
    label: found?.label ?? "Overview",
    icon: found?.icon ?? LiveLayoutGrid,
    ...config,
  };
}

export const OBSERVABILITY_VIEW_KEYS = Object.keys(CONFIG);
