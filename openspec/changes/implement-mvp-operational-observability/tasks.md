## 1. Telemetry foundation

- [ ] 1.1 Define `TelemetryPort`, stable signal names, label schemas and capability status.
- [ ] 1.2 Implement no-op and deterministic in-memory adapters.
- [ ] 1.3 Implement the OpenTelemetry adapter with environment-configured sampling/export.
- [ ] 1.4 Add allowlist, secret-canary and cardinality-budget tests.

## 2. Request and dependency signals

- [ ] 2.1 Centralize trusted correlation ID creation and response propagation.
- [ ] 2.2 Instrument Fastify HTTP RED metrics and stable route-template server spans.
- [ ] 2.3 Instrument authentication, context resolution, readiness and database dependencies.
- [ ] 2.4 Propagate trace/correlation context through outbox envelopes and processing spans.

## 3. MVP journey and outbox operations

- [ ] 3.1 Instrument the visit, order, kitchen, delivery, payment and close transition vocabulary.
- [ ] 3.2 Compute retry-safe journey durations from durable timestamps/events.
- [ ] 3.3 Add outbox counts, oldest age, throughput, retry, failure and expired-lease queries.
- [ ] 3.4 Add a protected aggregate outbox health surface and sanitized operational logs.

## 4. Verification and operation

- [ ] 4.1 Add a synthetic controlled-environment journey and publish sanitized CI evidence.
- [ ] 4.2 Measure instrumentation overhead, log volume and estimated free-tier consumption.
- [ ] 4.3 Write runbooks for API, database/auth, stuck outbox and failed MVP journey conditions.
- [ ] 4.4 Document remote dashboards/alerts/SLOs as `NOT_OPERATIONAL` until their activation gate.
- [ ] 4.5 Run typecheck, unit/API tests, synthetic checks and strict OpenSpec validation.

