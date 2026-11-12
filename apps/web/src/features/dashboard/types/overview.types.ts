/** Deploy volume this week and last, and how the last 30 days ended. */
export interface DeployStats {
  thisWeek: number;
  lastWeek: number;
  ready: number;
  failed: number;
  building: number;
}

/** Requests by UTC weekday (0 = Monday) and hour, over the last 28 days. */
export interface TrafficHeat {
  cells: number[][];
  total: number;
}
