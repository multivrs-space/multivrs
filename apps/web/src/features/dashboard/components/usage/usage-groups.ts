import {
  type AnimatedIcon,
  LiveActivity,
  LiveAtSign,
  LiveCloud,
  LiveGlobe,
  LiveImage,
  LiveRocket,
  LiveSquareFunction,
  LiveWorkflow,
} from "@/components/icons/animated";
import type { MeterFormat } from "@/features/dashboard/lib/usage-meters";

export interface MeterRow {
  key: string;
  label: string;
  format: MeterFormat;
  description: string;
}

export interface UsageGroup {
  id: string;
  label: string;
  icon: AnimatedIcon;
  rows: MeterRow[];
}

type Row = [key: string, label: string, format: MeterFormat, about: string];

function group(
  id: string,
  label: string,
  icon: AnimatedIcon,
  rows: Row[],
): UsageGroup {
  return {
    id,
    label,
    icon,
    rows: rows.map(([key, name, format, description]) => ({
      key,
      label: name,
      format,
      description,
    })),
  };
}

/** Every meter, grouped by the layer it measures. Keys match the usage service. */
// biome-ignore format: one line per meter reads as a table
export const USAGE_GROUPS: UsageGroup[] = [
  group("edge", "Edge network", LiveGlobe, [
    ["edge_requests", "Edge requests", "count", "Requests served by the edge"],
    ["fast_data_transfer", "Fast data transfer", "bytes", "Data delivered to visitors"],
    ["fast_origin_transfer", "Fast origin transfer", "bytes", "Data fetched from your origin"],
  ]),
  group("compute", "Compute", LiveSquareFunction, [
    ["function_invocations", "Function invocations", "count", "Calls to your functions"],
    ["function_duration_ms", "Function execution", "duration", "Time your functions ran"],
  ]),
  group("builds", "Builds and sandboxes", LiveRocket, [
    ["build_duration_ms_standard", "Build minutes", "minutes", "Time on standard build machines"],
    ["build_cache_read_bytes", "Cache downloads", "bytes", "Build cache restored"],
    ["build_cache_write_bytes", "Cache uploads", "bytes", "Build cache saved for later deploys"],
    ["sandbox_creations", "Sandboxes created", "count", "New sandboxes this period"],
    ["sandbox_active_ms", "Sandbox command time", "duration", "Time running sandbox commands"],
    ["sandbox_provisioned_ms", "Sandbox provisioned time", "duration", "Time sandboxes were kept up"],
    ["concurrent_sandboxes", "Running sandboxes", "count", "Creating or running right now"],
  ]),
  group("workflows", "Workflows", LiveWorkflow, [
    ["workflow_events", "Workflow steps", "count", "Durable steps run"],
    ["workflow_data_written_bytes", "Data written", "bytes", "Payloads and step results written"],
    ["workflow_data_retained_bytes", "Data retained", "bytes", "Inputs and outputs kept now"],
  ]),
  group("images", "Images and caching", LiveImage, [
    ["image_transformations", "Image transformations", "count", "Unique resizes and formats"],
    ["image_cache_reads", "Image cache reads", "count", "Optimized images served from cache"],
    ["image_cache_writes", "Image cache writes", "count", "Optimized images written to cache"],
    ["isr_reads", "ISR reads", "count", "Incremental pages served from cache"],
    ["isr_writes", "ISR writes", "count", "Incremental pages regenerated"],
  ]),
  group("storage", "Storage and routing", LiveCloud, [
    ["blob_storage_size", "Blob storage", "bytes", "Stored in Multivrs Blob now"],
    ["blob_data_transfer", "Blob transfer", "bytes", "Delivered from Multivrs Blob"],
    ["blob_simple_operations", "Blob reads", "count", "Reads served at the edge"],
    ["blob_advanced_operations", "Blob writes", "count", "Uploads and deletes"],
    ["edge_config_reads", "Edge Config reads", "count", "Config reads at the edge"],
    ["edge_config_writes", "Edge Config writes", "count", "Values written this period"],
    ["edge_config_entries", "Edge Config entries", "count", "Values published now"],
    ["bulk_redirects", "Bulk redirects", "count", "Redirects enabled now"],
    ["microfrontend_routing", "Microfrontend routing", "count", "Requests routed across mounts"],
    ["microfrontend_mounts", "Microfrontend mounts", "count", "Mounts enabled now"],
  ]),
  group("analytics", "Analytics", LiveActivity, [
    ["web_analytics_events", "Web Analytics events", "count", "Page views and custom events"],
    ["speed_insights_events", "Speed Insights events", "count", "Web vitals; included per project"],
  ]),
  group("email", "Email", LiveAtSign, [
    ["mail_email_units", "Emails", "count", "Messages sent and received"],
  ]),
];

/** The four meters most workspaces watch, in the order they're charted. */
export const HEADLINE_METERS: MeterRow[] = [
  {
    key: "edge_requests",
    label: "Requests",
    format: "count",
    description: "Requests served by the edge",
  },
  {
    key: "fast_data_transfer",
    label: "Data transfer",
    format: "bytes",
    description: "Data delivered to visitors",
  },
  {
    key: "function_invocations",
    label: "Functions",
    format: "count",
    description: "Calls to your functions",
  },
  {
    key: "build_duration_ms_standard",
    label: "Build minutes",
    format: "minutes",
    description: "Time on standard build machines",
  },
];
