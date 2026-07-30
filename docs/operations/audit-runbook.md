# Sensitive mutation audit operations

This runbook covers the Floor, Ordering, Kitchen and Cash mutation audit
boundary. The route registry in `apps/api/src/http/mutation-audit.ts` is the
source of truth for covered HTTP commands and stable business action codes.
Application startup rejects a covered mutation route without a policy.

## Evidence contract

Each terminal attempt records tenant, permitted branch when known, actor,
business action code, resource, outcome, reason, request ID and correlation ID.
Successful responses wait for the audit append. Denied and failed responses
append after the response and report append failures through logs and metrics.

Evidence uses an allowlist. Authentication material, credentials, payment-card
data, contact data and free-form notes are removed centrally. Strings,
collections, nesting and the final serialized value are bounded. Idempotency
keys are stored only as SHA-256 hashes.

The HTTP fail-closed behavior prevents a successful response when audit storage
fails, but it is not a PostgreSQL transaction rollback. Until an audit-aware
unit of work is implemented for persistent adapters, operators must treat an
`AUDIT_APPEND_FAILED` event after a business write as a possible reconciliation
incident.

## Incident lookup

1. Capture the response `X-Correlation-Id`, tenant and permitted branch from
   trusted incident context. Do not paste tokens, card data or request bodies.
2. Query `GET /v1/audit-logs?correlation_id=<uuid>` as OWNER or ADMIN.
3. Narrow with `action_code`, `outcome`, `resource_type`, `resource_id`, `from`
   and `to`. A branch-scoped reader cannot request another branch.
4. Match the audit request ID with structured API logs. The relevant failure
   log uses event code `AUDIT_APPEND_FAILED`.
5. Preserve append-only records. Never edit or delete audit evidence during
   recovery.

## Signals and alert activation

- `maitre.audit.append{action_code,outcome}` counts audit-store successes and
  failures.
- `maitre.audit.evidence_size_bytes{action_code,outcome}` records bounded
  evidence size.
- `maitre.audit.policy_missing{method,route}` records rejected route
  registration.

Until a telemetry backend, owner and notification channel are approved, these
signals are local/CI evidence and not an operational alert. On activation, page
on any successful-mutation append failure, any policy-missing signal, or five
failed/denied-attempt append failures in five minutes. Warn when p95 evidence
size exceeds 6 KiB for fifteen minutes. The alert must link this runbook and be
tested end to end before being declared operational.

## Recovery and rollback

For a policy-registration failure, add the explicit policy and tests; do not
remove the coverage gate. For audit-store unavailability, stop or roll back the
deployment if successful commands cannot be safely reconciled. Use business
state, outbox records, correlation IDs and immutable audit history to identify
the affected interval. Append a corrective audit fact after recovery; never
backdate, overwrite or fabricate the missing original fact.

Rolling back this feature may disable enforcement but must retain additive
columns and all existing audit records. Database schema rollback must not drop
audit data.
