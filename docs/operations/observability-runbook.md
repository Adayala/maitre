# Maitre operational observability

This runbook records the current operational capability for SPEC-216 and
SPEC-222. Local instrumentation and deterministic test evidence are available.
Remote export, dashboards, alerts and SLO enforcement are not operational.

## Capability status

| Capability | Status | Evidence |
| --- | --- | --- |
| HTTP RED metrics | `OPERATIONAL_LOCAL` | `@maitre/telemetry` in-memory contract tests |
| Request spans and W3C parent acceptance | `OPERATIONAL_LOCAL` | API observability tests |
| Correlation response propagation | `OPERATIONAL_LOCAL` | API observability tests |
| Database readiness state | `OPERATIONAL_LOCAL` | `/health/ready` instrumentation |
| OpenTelemetry remote exporter | `NOT_OPERATIONAL` | Adapter and backend are not configured |
| MVP transition/duration signals | `NOT_OPERATIONAL` | Durable transition instrumentation is pending |
| Outbox backlog/age/retry signals | `NOT_OPERATIONAL` | Aggregate persistence query is pending |
| Dashboards, alerts and paging | `NOT_OPERATIONAL` | No approved backend, owner or channel |
| SLO/error-budget enforcement | `NOT_OPERATIONAL` | Baseline and activation gate are pending |

Do not interpret local instrumentation as evidence that a production alert
will fire.

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

Use bounded outcome counts and correlated spans once dependency spans are
implemented. Until then, health and sanitized application logs are the only
available evidence. Do not claim a dependency alert exists.

## Stuck outbox

The aggregate outbox health projection is pending. Investigation currently
requires an authorized database operator to inspect aggregate status counts,
oldest `PENDING` age, attempts, failures and expired leases. Payloads and
tenant/resource identifiers must not be copied into tickets or telemetry.
Escalate repeated failures to the service owner and preserve records; do not
delete or replay events without an approved recovery procedure.

## Failed MVP synthetic journey

The authoritative synthetic journey is pending. When enabled, identify the
first missing transition in:

`VISIT_OPENED → ORDER_SUBMITTED → KITCHEN_STARTED → KITCHEN_READY →
ORDER_DELIVERED → PAYMENT_CAPTURED → VISIT_CLOSED`.

Correlate traces and audit evidence by correlation ID. Avoid metric labels with
business identifiers. If the transition fact exists but its signal does not,
treat it as an instrumentation defect rather than a business rollback.

## Activation gate

Remote capability can change from `NOT_OPERATIONAL` only after an ADR records:
backend and retention, data region, operating owner, notification channel,
measured baseline, alert thresholds, cost estimate and an end-to-end alert
test. The same evidence is required before an SLO can block a release.
