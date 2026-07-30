## ADDED Requirements

### Requirement: Portable telemetry boundary

The system SHALL emit logs, metrics and traces through a vendor-neutral telemetry port. Pure
domain modules MUST NOT depend on an observability SDK. No-op and in-memory adapters MUST preserve
business behavior and allow deterministic verification without network access.

#### Scenario: No remote exporter is configured

- **WHEN** the API starts in local or test without an observability backend
- **THEN** request processing, correlation and instrumentation remain functional
- **AND** tests can inspect emitted signals through the in-memory adapter

### Requirement: Correlated request and dependency traces

The API MUST validate or generate a correlation ID, accept valid W3C trace context, return the
correlation ID to the caller and create stable route-template spans for HTTP, authentication,
application commands and dependencies. Jobs and outbox events MUST preserve correlation and trace
causality without treating trace metadata as authority.

#### Scenario: Valid incoming trace context

- **WHEN** a request contains valid `traceparent` and correlation headers
- **THEN** the server span continues the trace and returns the trusted correlation ID
- **AND** child application and dependency spans share the same causal context

#### Scenario: Invalid incoming context

- **WHEN** trace or correlation headers are malformed or exceed their limit
- **THEN** the server safely replaces or rejects them according to the HTTP contract
- **AND** no untrusted value appears as a metric label, span name or log field

### Requirement: Bounded golden-signal metrics

The API SHALL record request count, error count, active requests and duration using stable method,
route-template, status-class and outcome labels. Auth, readiness, database and command signals
MUST use documented low-cardinality labels.

#### Scenario: Dynamic resource request

- **WHEN** requests target many different resource IDs on the same route
- **THEN** all observations use one route-template label
- **AND** tenant, branch, user, resource, correlation, full URL and error messages are absent from
  metric labels

### Requirement: Observable MVP journey

The system SHALL measure success, failure and elapsed time across visit opening, order submission,
kitchen start/readiness, delivery, payment capture and visit close. Measurements MUST survive
process restarts and MUST NOT be duplicated by idempotent retries or repeated event delivery.

#### Scenario: Completed restaurant journey

- **WHEN** one visit reaches every authoritative MVP transition and closes
- **THEN** transition counters and end-to-end duration are emitted exactly once
- **AND** the related trace/audit evidence can be found by correlation without using identifiers
  as metric labels

#### Scenario: Journey stalls in kitchen

- **WHEN** an order is submitted but no kitchen-ready transition occurs within the configured
  diagnostic threshold
- **THEN** the persisted timestamps permit the stalled segment to be measured
- **AND** the condition links to an operational query and runbook

### Requirement: Observable durable outbox

The outbox SHALL expose aggregate pending, processing, published and failed counts, oldest pending
age, publish throughput, retry count and expired-lease recovery. Operational surfaces MUST NOT
expose event payloads or tenant/resource identifiers.

#### Scenario: Publisher backlog grows

- **WHEN** pending events remain unpublished beyond the diagnostic threshold
- **THEN** backlog count and oldest-event age reflect the condition
- **AND** logs/traces identify the publisher failure class and correlation without exposing payload

### Requirement: Verified operational capability status

Local/CI telemetry evidence MUST be reproducible and sanitized. A remote dashboard, alert, SLO or
error-budget gate MUST remain `NOT_OPERATIONAL` until a backend, retention policy, owner, channel,
baseline and end-to-end delivery test are recorded.

#### Scenario: No telemetry backend has been approved

- **WHEN** local metrics and traces pass their contract tests
- **THEN** the implementation may claim instrumented local/CI capability
- **BUT** it does not claim durable dashboards, paging or SLO enforcement
