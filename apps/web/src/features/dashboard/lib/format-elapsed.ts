/** "42s", "3m 05s", "1h 02m". */
export function formatElapsed(seconds: number): string {
  if (seconds >= 3_600)
    return `${Math.floor(seconds / 3_600)}h ${String(Math.floor((seconds % 3_600) / 60)).padStart(2, "0")}m`;
  if (seconds >= 60)
    return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  return `${seconds}s`;
}
