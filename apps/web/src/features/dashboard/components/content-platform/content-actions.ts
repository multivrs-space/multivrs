import { toast } from "sonner";
import type { ContentPlatformData } from "@/features/dashboard/types/content-platform.types";

/** JSON request that throws the API's own error message on failure. */
export async function json<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const message = body && "error" in body ? body.error?.message : undefined;
    throw new Error(message ?? "The request could not be completed");
  }
  return (await response.json()) as T;
}

export const JSON_HEADERS = { "content-type": "application/json" };

export type RunAction = <T>(
  key: string,
  task: () => Promise<T>,
  done: (value: T) => void,
) => Promise<void>;

export type SetData = React.Dispatch<React.SetStateAction<ContentPlatformData>>;

/** Run one edge change, tracking which control is busy and toasting the result. */
export async function runContentAction<T>({
  done,
  key,
  setBusy,
  task,
}: {
  done: (value: T) => void;
  key: string;
  setBusy: React.Dispatch<React.SetStateAction<string | null>>;
  task: () => Promise<T>;
}) {
  setBusy(key);
  try {
    const value = await task();
    done(value);
    toast.success("Changes are live at the edge");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Request failed");
  } finally {
    setBusy(null);
  }
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}
