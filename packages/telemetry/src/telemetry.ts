export const TELEMETRY_SIGNALS = {
  httpRequests: "maitre.http.server.requests",
  httpDuration: "maitre.http.server.duration_ms",
  readiness: "maitre.health.readiness",
  journeyTransition: "maitre.mvp.journey.transition",
  journeyDuration: "maitre.mvp.journey.duration_ms",
  outboxBacklog: "maitre.outbox.backlog",
  outboxOldestAge: "maitre.outbox.oldest_pending_age_ms",
  auditAppend: "maitre.audit.append",
  auditEvidenceSize: "maitre.audit.evidence_size_bytes",
  auditPolicyMissing: "maitre.audit.policy_missing",
} as const;

export type TelemetrySignal =
  (typeof TELEMETRY_SIGNALS)[keyof typeof TELEMETRY_SIGNALS];

export type TelemetryAttributes = Readonly<Record<string, string>>;

export interface SpanOptions {
  attributes?: TelemetryAttributes;
  parentTraceparent?: string;
}

export interface TelemetrySpan {
  end(outcome?: "OK" | "ERROR"): void;
}

export interface TelemetryPort {
  increment(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void;
  observe(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void;
  gauge(
    signal: TelemetrySignal,
    value: number,
    attributes: TelemetryAttributes,
  ): void;
  startSpan(name: string, options?: SpanOptions): TelemetrySpan;
}

export interface TelemetryCapabilityStatus {
  instrumentation: "OPERATIONAL";
  localEvidence: "OPERATIONAL";
  remoteExport: "NOT_OPERATIONAL";
  dashboards: "NOT_OPERATIONAL";
  alerts: "NOT_OPERATIONAL";
  slos: "NOT_OPERATIONAL";
}

export const LOCAL_TELEMETRY_CAPABILITY: TelemetryCapabilityStatus = {
  instrumentation: "OPERATIONAL",
  localEvidence: "OPERATIONAL",
  remoteExport: "NOT_OPERATIONAL",
  dashboards: "NOT_OPERATIONAL",
  alerts: "NOT_OPERATIONAL",
  slos: "NOT_OPERATIONAL",
};
