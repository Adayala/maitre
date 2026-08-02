> Historial de implementación migrado al árbol SDD; SPEC-216 es la fuente normativa vigente.

## Context

Fastify emits default logs and exposes live/ready endpoints. There is no common telemetry port,
trace propagation, bounded metric registry or outbox health query. Vercel captures stdout, but that
alone cannot correlate a critical journey or establish measurable service health.

## Goals / Non-Goals

- Goals:
  - instrument the minimum technical and product signals required by SPEC-216/222;
  - preserve trace/correlation across synchronous and asynchronous boundaries;
  - prevent sensitive or high-cardinality telemetry;
  - provide deterministic in-memory verification and portable export;
  - make operational capability status explicit.
- Non-Goals:
  - choose or purchase a production observability vendor;
  - declare dashboards, paging or SLOs operational without owner/backend evidence;
  - turn audit/domain events into technical logs;
  - instrument pure domain entities with an SDK.

## Decisions

### Telemetry enters through ports

Application/composition code uses a small `TelemetryPort` for spans, counters, histograms, gauges
and structured events. An OpenTelemetry adapter implements the port. Domain entities remain pure.
No-op and in-memory adapters support local execution and deterministic tests.

The API initializes instrumentation before Fastify registration and shuts exporters down within
the serverless/process lifecycle budget. Export configuration is environment-driven; missing
remote export keeps local propagation and instrumentation active.

### Correlation and traces share request context

A Fastify hook validates or creates the correlation ID and lets the standard OpenTelemetry
propagator parse `traceparent`. Stable server span names use method plus route template. Child
spans cover authentication/context resolution, application commands, persistence and external
dependencies.

Outbox envelopes carry W3C trace context or a trace link plus correlation/causation IDs. Consumers
start a new processing span linked to the producer and never trust trace metadata for authority.

### Metric labels are closed vocabularies

HTTP RED metrics use method, route template, status class and outcome. Auth, dependency and
application-command metrics use small documented enums. Tenant, branch, user, resource,
correlation, full URL and error messages are forbidden labels and enforced in tests.

### Journey signals use transition facts

The MVP emits stable transition counters and duration histograms for:

`VISIT_OPENED → ORDER_SUBMITTED → KITCHEN_STARTED → KITCHEN_READY → ORDER_DELIVERED →
PAYMENT_CAPTURED → VISIT_CLOSED`.

Identifiers stay in trace/audit context, not metric labels. Duration is computed from persisted
domain timestamps or event metadata so retries and process restarts do not reset the measurement.
Duplicate transition events are deduplicated by event/aggregate identity.

### Outbox has an operational projection

The persistence port exposes aggregate counts by status, oldest pending age, publish throughput,
retry count, failure count and lease-expiry recovery. A protected internal check and exporter read
only aggregate values. Outbox health does not reveal payloads or tenant/resource identifiers.

### Capability state is honest

In-memory exporter tests and sanitized CI reports prove instrumentation. Remote dashboards, alerts,
SLOs and error budgets remain `NOT_OPERATIONAL` until an ADR records backend, retention, owner,
channel, observed baseline and end-to-end alert test.

## Risks / Trade-offs

- SDK startup can affect serverless latency. Measure enabled/disabled p50/p95 and keep exporters
  batch-based with bounded shutdown.
- Product durations can be double-counted by retries. Compute from durable transitions and
  deduplicate.
- Metric cardinality can grow unnoticed. Enforce label schemas and cardinality budgets in tests.
- Telemetry can leak data. Apply allowlists before adapter serialization and use secret canaries.

## Migration Plan

1. Add ports, no-op/in-memory adapters and privacy/cardinality contract tests.
2. Instrument HTTP, correlation, auth/context and readiness.
3. Instrument critical commands and persisted journey durations.
4. Add outbox health projection and publisher/consumer spans when the worker exists.
5. Add synthetic CI/manual evidence and runbooks.
6. Select a backend separately before activating alerts or SLO gates.

Rollback selects the no-op adapter; health endpoints and business behavior remain available.
