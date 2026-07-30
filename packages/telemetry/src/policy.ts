import {
  TELEMETRY_SIGNALS,
  type TelemetryAttributes,
  type TelemetrySignal,
} from "./telemetry.js";

const LABEL_SCHEMA: Record<TelemetrySignal, readonly string[]> = {
  [TELEMETRY_SIGNALS.httpRequests]: [
    "method",
    "route",
    "status_class",
    "outcome",
  ],
  [TELEMETRY_SIGNALS.httpDuration]: [
    "method",
    "route",
    "status_class",
    "outcome",
  ],
  [TELEMETRY_SIGNALS.readiness]: ["dependency", "outcome"],
  [TELEMETRY_SIGNALS.journeyTransition]: ["transition", "outcome"],
  [TELEMETRY_SIGNALS.journeyDuration]: ["transition", "outcome"],
  [TELEMETRY_SIGNALS.outboxBacklog]: ["status"],
  [TELEMETRY_SIGNALS.outboxOldestAge]: ["status"],
  [TELEMETRY_SIGNALS.auditAppend]: ["action_code", "outcome"],
  [TELEMETRY_SIGNALS.auditEvidenceSize]: ["action_code", "outcome"],
  [TELEMETRY_SIGNALS.auditPolicyMissing]: ["method", "route"],
};

const FORBIDDEN_LABELS = new Set([
  "tenant",
  "tenant_id",
  "branch",
  "branch_id",
  "user",
  "user_id",
  "resource_id",
  "correlation_id",
  "trace_id",
  "url",
  "error",
  "error_message",
]);

export function assertTelemetryAttributes(
  signal: TelemetrySignal,
  attributes: TelemetryAttributes,
): void {
  const allowed = new Set(LABEL_SCHEMA[signal]);
  for (const [key, value] of Object.entries(attributes)) {
    if (FORBIDDEN_LABELS.has(key) || !allowed.has(key)) {
      throw new Error(`telemetry-label-not-allowed:${signal}:${key}`);
    }
    if (looksSensitive(value)) {
      throw new Error(`telemetry-label-value-rejected:${signal}:${key}`);
    }
  }

  if ("route" in attributes) {
    const route = attributes["route"];
    if (
      route !== "UNMATCHED" &&
      (!route?.startsWith("/") ||
        route.includes("?") ||
        UUID_OR_NUMBER.test(route))
    ) {
      throw new Error(`telemetry-route-not-template:${route}`);
    }
  }
}

export function assertSpanAttributes(attributes: TelemetryAttributes): void {
  const allowed = new Set(["http.request.method", "http.route"]);
  for (const [key, value] of Object.entries(attributes)) {
    if (!allowed.has(key) || FORBIDDEN_LABELS.has(key)) {
      throw new Error(`telemetry-span-label-not-allowed:${key}`);
    }
    if (looksSensitive(value)) {
      throw new Error(`telemetry-span-label-value-rejected:${key}`);
    }
  }
  const route = attributes["http.route"];
  if (
    route !== undefined &&
    route !== "UNMATCHED" &&
    (!route.startsWith("/") ||
      route.includes("?") ||
      UUID_OR_NUMBER.test(route))
  ) {
    throw new Error(`telemetry-route-not-template:${route}`);
  }
}

const UUID_OR_NUMBER =
  /(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|\/\d+(?:\/|$))/i;

function looksSensitive(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("authorization") ||
    normalized.includes("bearer ") ||
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("api_key")
  );
}
