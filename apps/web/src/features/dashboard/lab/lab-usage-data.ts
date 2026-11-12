import type { UsageMeter } from "@/features/dashboard/types/usage.types";

/* Synthetic meters for tuning the usage views in the lab only. Product
   pages never render made-up numbers. 27 days into a 31-day period. */

const DAYS = 27;
const GiB = 1024 ** 3;
const MINUTE = 60_000;

function flow(
  total: number,
  included?: number | null,
  wave = 0.35,
): UsageMeter {
  const shape = Array.from(
    { length: DAYS },
    (_, day) => 1 + wave * Math.sin(day / 2.4) + day / 40,
  );
  const sum = shape.reduce((a, b) => a + b, 0);
  const daily = shape.map((value) => Math.round((value / sum) * total));
  const used = daily.reduce((a, b) => a + b, 0);
  return included === undefined ? { used, daily } : { used, included, daily };
}

export const LAB_METERS: Record<string, UsageMeter> = {
  edge_requests: flow(1_284_000, 1_000_000),
  fast_data_transfer: flow(38.4 * GiB, 50 * GiB),
  fast_origin_transfer: flow(6.1 * GiB, 50 * GiB),
  function_invocations: flow(412_000, 1_000_000),
  function_duration_ms: flow(96 * MINUTE, 120 * MINUTE),
  build_duration_ms_standard: flow(431 * MINUTE, 500 * MINUTE, 0.8),
  build_cache_read_bytes: flow(3.2 * GiB, 10 * GiB),
  build_cache_write_bytes: flow(1.1 * GiB, 10 * GiB),
  sandbox_creations: flow(9, 25, 0.9),
  sandbox_active_ms: flow(22 * MINUTE, 60 * MINUTE),
  sandbox_provisioned_ms: flow(4.5 * 60 * MINUTE, 10 * 60 * MINUTE),
  concurrent_sandboxes: { used: 1, daily: [] },
  workflow_events: flow(18_400, 100_000),
  workflow_data_written_bytes: flow(0.21 * GiB, GiB),
  workflow_data_retained_bytes: { used: 0.34 * GiB, included: GiB, daily: [] },
  image_transformations: flow(812, 1_000, 0.6),
  image_cache_reads: flow(204_000, 1_000_000),
  image_cache_writes: flow(9_800, 100_000),
  isr_reads: flow(88_000, 1_000_000),
  isr_writes: flow(2_300, 100_000),
  blob_storage_size: { used: 2.4 * GiB, included: 5 * GiB, daily: [] },
  blob_data_transfer: flow(7.9 * GiB, 50 * GiB),
  blob_simple_operations: flow(61_000, 1_000_000),
  blob_advanced_operations: flow(1_900, 100_000),
  edge_config_reads: flow(140_000, 1_000_000),
  edge_config_writes: flow(120, 10_000),
  edge_config_entries: { used: 14, daily: [] },
  bulk_redirects: { used: 32, daily: [] },
  microfrontend_routing: flow(0, 500_000),
  microfrontend_mounts: { used: 0, daily: [] },
  web_analytics_events: flow(301_000, 1_000_000),
  speed_insights_events: flow(18_200),
  mail_email_units: flow(388, 500, 0.7),
};
