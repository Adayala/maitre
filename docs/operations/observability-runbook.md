# Maitre operational observability

This runbook records the current operational capability for SPEC-216 and
SPEC-222. Local instrumentation and deterministic test evidence are available.
OTLP export is environment-configurable. ADR-005 intentionally keeps the MVP
Demo without a remote backend, dashboards, alerts or SLO enforcement.

For the consolidated implementation/evidence map, see the
[MVP gap closure record](mvp-gap-closure-2026-07-30.md).

## Capability status

| Capability                                  | Status                     | Evidence                                          |
| ------------------------------------------- | -------------------------- | ------------------------------------------------- |
| HTTP RED/active metrics                     | `OPERATIONAL_LOCAL`        | `@maitre/telemetry` contract and API tests        |
| Request, auth, dependency and journey spans | `OPERATIONAL_LOCAL`        | API and journey observability tests               |
| Correlation response propagation            | `OPERATIONAL_LOCAL`        | API observability tests                           |
| Database readiness state                    | `OPERATIONAL_LOCAL`        | `/health/ready` instrumentation                   |
| OpenTelemetry OTLP exporter                 | `AVAILABLE_NOT_CONFIGURED` | Environment-driven adapter; no approved backend   |
| MVP transition/duration signals             | `OPERATIONAL_LOCAL`        | Durable outbox projection and deduplication tests |
| Outbox backlog/age/retry signals            | `OPERATIONAL_LOCAL`        | Aggregate memory/PostgreSQL projection            |
| Dashboards, alerts and paging               | `NOT_OPERATIONAL`          | No approved backend, owner or channel             |
| SLO/error-budget enforcement                | `NOT_OPERATIONAL`          | Baseline and activation gate are pending          |
| Authoritative synthetic release gate        | `OPERATIONAL_CI`           | Durable Supabase journey required before deploy   |

## Reproducible cost and overhead evidence

Run `npm run observability:evidence` to emit a sanitized JSON artifact with p50/p95
instrumentation overhead, records and representative uncompressed bytes per request, and a
configurable volume projection (`OBSERVABILITY_PROJECTED_REQUESTS`). CI uploads that artifact with
the quality evidence.

The benchmark intentionally excludes network transport from the latency figure; the separate
`npm run test:telemetry:export` integration proves OTLP/HTTP trace and metric delivery. The report
does not contain request payloads or resource identifiers. Its estimates are a baseline, not an
approved production budget or a provider-specific free-tier claim. Those remain
`NOT_OPERATIONAL` until SPK-05 selects a backend, retention and quota.

Do not interpret local instrumentation as evidence that a production alert
will fire.

## OTLP activation

Set `OTEL_EXPORTER_OTLP_ENDPOINT` or the signal-specific
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` and
`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`. `OTEL_SERVICE_NAME` defaults to
`maitre-api`; sampling follows standard `OTEL_TRACES_SAMPLER` variables and
metric cadence follows `OTEL_METRIC_EXPORT_INTERVAL` /
`OTEL_METRIC_EXPORT_TIMEOUT`. `OTEL_SDK_DISABLED=true` forces the no-op
adapter.

An endpoint only proves export configuration. The activation gate below still
applies before remote capability is called operational.

## API or readiness incident

1. Check `/health/live`, then `/health/ready`.
2. Compare `maitre.http.server.requests` and
   `maitre.http.server.duration_ms` by route template and status class.
3. Use the response `X-Correlation-Id` to find sanitized request logs and the
   matching server span. Never add tenant, branch, user, URL or error text as a
   metric label.
4. If readiness reports `not_ready`, verify database reachability and
   credentials without logging credential values. Roll back the latest
   infrastructure or schema change if it aligns with the transition.

## Authentication or database dependency incident

Use `maitre.auth.attempts`, `maitre.auth.context_resolution`, correlated auth
spans and the readiness database span. Health and sanitized application logs
remain fallback evidence. Do not claim a dependency alert exists.

## Stuck outbox

Use `GET /v1/operations/outbox-health` as an OWNER/ADMIN for a tenant-scoped,
payload-free snapshot. `/health/ready` emits global aggregate gauges for
status counts, oldest `PENDING` age, five-minute publish throughput, retries,
failures and expired leases. Payloads and tenant/resource identifiers must not
be copied into tickets or telemetry. Escalate repeated failures to the service
owner and preserve records; do not delete or replay events without an approved
recovery procedure.

## Failed MVP synthetic journey

The durable journey projector emits and marks each outbox transition once.
Identify the first missing transition in:

`VISIT_OPENED → ORDER_SUBMITTED → KITCHEN_STARTED → KITCHEN_READY →
ORDER_DELIVERED → PAYMENT_CAPTURED → VISIT_CLOSED`.

Correlate consumer spans and audit evidence by correlation ID. Avoid metric
labels with business identifiers. If the transition fact exists but its signal
does not, inspect `telemetry_observed_at`; treat the mismatch as an
instrumentation defect rather than a business rollback.

## Activation gate

ADR-005 keeps remote capability `NOT_OPERATIONAL` for MVP Demo. A successor
decision can activate it only after recording:
backend and retention, data region, operating owner, notification channel,
measured baseline, alert thresholds, cost estimate and an end-to-end alert
test. The same evidence is required before an SLO can block a release.
