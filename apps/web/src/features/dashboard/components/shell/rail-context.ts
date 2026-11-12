"use client";

import { createContext, use } from "react";

export interface RailState {
  /** The user pinned the rail to icons only. */
  collapsed: boolean;
  /** Icons only, either pinned or because a context panel is open. */
  narrow: boolean;
  toggle: () => void;
}

export const RailContext = createContext<RailState>({
  collapsed: false,
  narrow: false,
  toggle: () => {},
});

export function useRail(): RailState {
  return use(RailContext);
}
