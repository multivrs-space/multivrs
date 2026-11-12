import type { DashboardWorkflowStep } from "@/features/dashboard/types/platform-workflow.types";
import { randomId } from "@/lib/browser/random-id";

export interface EditableStep extends DashboardWorkflowStep {
  clientId: string;
}

export function newHttpStep(clientId = randomId()): EditableStep {
  return {
    clientId,
    headers: {},
    method: "POST",
    name: "HTTP request",
    retries: 2,
    timeoutSeconds: 30,
    type: "http",
    url: "",
  };
}

export function newDelayStep(): EditableStep {
  return {
    clientId: randomId(),
    durationSeconds: 60,
    name: "Wait",
    type: "delay",
  };
}

/** The API shape of a step, without editor-only fields. */
export function cleanStep(step: DashboardWorkflowStep): DashboardWorkflowStep {
  return step.type === "delay"
    ? { durationSeconds: step.durationSeconds, name: step.name, type: "delay" }
    : {
        body: step.body,
        headers: step.headers ?? {},
        method: step.method ?? "POST",
        name: step.name,
        retries: step.retries ?? 2,
        timeoutSeconds: step.timeoutSeconds ?? 30,
        type: "http",
        url: step.url,
      };
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const pad = (value: string) => value.padStart(2, "0");

/**
 * A plain-English reading of common five-field cron expressions, in UTC.
 * Returns null for anything it can't describe confidently.
 */
export function describeCron(expression: string): string | null {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;
  const numeric = (value: string | undefined) =>
    value !== undefined && /^\d+$/.test(value);
  const everyN = minute?.match(/^\*\/(\d+)$/);

  if (
    everyN &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Every ${everyN[1]} minutes`;
  }
  if (
    minute === "*" &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return "Every minute";
  }
  if (
    numeric(minute) &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Every hour at :${pad(minute ?? "0")}`;
  }
  if (!numeric(minute) || !numeric(hour) || month !== "*") return null;
  const time = `${pad(hour ?? "0")}:${pad(minute ?? "0")} UTC`;
  if (dayOfMonth === "*" && dayOfWeek === "*") return `Every day at ${time}`;
  if (dayOfMonth === "*" && dayOfWeek === "1-5") return `Weekdays at ${time}`;
  if (dayOfMonth === "*" && numeric(dayOfWeek)) {
    const day = DAYS[Number(dayOfWeek) % 7];
    return day ? `Every ${day} at ${time}` : null;
  }
  if (numeric(dayOfMonth) && dayOfWeek === "*")
    return `Monthly on day ${dayOfMonth} at ${time}`;
  return null;
}
