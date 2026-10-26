"use client";

import { useEffect, useState } from "react";
import { readableError, requestOk } from "@/lib/api/request.client";
import {
  type FrameworkDetection,
  frameworkDetectionSchema,
} from "@/lib/schemas/github.schemas";

export type DetectionState =
  | { status: "detecting" }
  | { status: "detected"; result: FrameworkDetection }
  | { status: "failed"; error: string };

interface DetectionTarget {
  owner: string;
  repo: string;
  /** Empty string means the repository's default branch. */
  ref: string;
  root: string;
}

/** Reads the repository on GitHub and reports its framework and package manager. */
export function useFrameworkDetection({
  owner,
  repo,
  ref,
  root,
}: DetectionTarget) {
  const [state, setState] = useState<DetectionState>({ status: "detecting" });
  useEffect(() => {
    let active = true;
    setState({ status: "detecting" });
    const query = new URLSearchParams({ owner, repo, root });
    if (ref) query.set("ref", ref);
    void requestOk(
      `/api/github/detect?${query.toString()}`,
      {},
      "Framework detection failed",
    )
      .then((response) => response.json())
      .then((body) => frameworkDetectionSchema.parse(body))
      .then((result) => {
        if (active) setState({ status: "detected", result });
      })
      .catch((cause: unknown) => {
        if (active)
          setState({
            status: "failed",
            error: readableError(cause, "Framework detection failed"),
          });
      });
    return () => {
      active = false;
    };
  }, [owner, repo, ref, root]);
  return state;
}
