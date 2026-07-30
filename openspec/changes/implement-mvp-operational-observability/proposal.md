# Change: Implement MVP operational observability

## Why

Maitre exposes liveness and a database readiness probe, but SPEC-216 and SPEC-222 also require
portable metrics, traces, correlation and operational evidence for the restaurant journey.
Without those signals, failures between Floor, Ordering, Kitchen, Check, Payment and the outbox
cannot be detected or diagnosed reliably.

## What Changes

- Add a vendor-neutral `TelemetryPort` backed by OpenTelemetry at API composition boundaries.
- Instrument HTTP, authentication/context, database dependencies and critical application commands.
- Accept and propagate valid W3C trace context through requests, jobs and domain/outbox events.
- Add bounded RED metrics and structured sanitized logs with correlation.
- Measure the MVP journey from visit opening through order, kitchen, delivery, payment and close.
- Expose outbox backlog, age, throughput, retry and failure signals.
- Add readiness transition evidence, synthetic journey checks and minimum incident runbooks.
- Produce local/CI evidence without claiming operational dashboards, paging or SLOs before a
  backend and owner are approved.

## Impact

- Affected specs: SPEC-213, SPEC-215, SPEC-216, SPEC-217, SPEC-221 and SPEC-222.
- Affected code: API composition/hooks, telemetry contracts/adapters, critical domain command
  boundaries, outbox persistence/worker and operational tests/tooling.
- Dependencies: OpenTelemetry API/SDK packages remain behind adapters and do not enter pure domain
  modules.

