> Historial de implementación migrado al árbol SDD; SPEC-215 es la fuente normativa vigente.

## Context

Fastify already registers Swagger and most handlers validate input with Zod inside the handler.
That produces a route catalog, but it cannot serve as a complete public contract or detect
breaking changes. Error construction is repeated by routes and CORS reflects arbitrary origins in
non-production environments.

## Goals / Non-Goals

- Goals:
  - make the HTTP contract deterministic, reviewable and enforceable;
  - standardize all API failures without leaking implementation details;
  - make browser origins explicit in every environment;
  - introduce the gate incrementally without changing successful domain behavior.
- Non-Goals:
  - generate client SDKs in this change;
  - redesign resource names or endpoint semantics;
  - expose internal endpoints as public API;
  - localize server error messages.

## Decisions

### Generated OpenAPI is the reviewed artifact

`apps/api` will expose a non-listening contract generator that builds the same application and
writes a stable `openapi.json`. Volatile values and non-semantic ordering will be normalized so
regeneration produces no diff when the contract is unchanged.

Every public route will contribute typed request and response schemas to the generated artifact.
Shared headers, security schemes, envelopes and problems will come from reusable contract schemas
instead of copied objects.

The committed artifact derives each operation's request shape from the Zod parse result or typed
Fastify request used by that handler, and derives successful representations from the handler's
TypeScript return expressions. This avoids a parallel hand-maintained DTO registry while preserving
the runtime's real optional fields, unions, enums, dates, collections, 204 responses and non-JSON
representations. A generation test covers representative body, envelope, bare discovery, 204 and
fiscal-document routes; policy rejects any operation that falls back to `SuccessEnvelope`.

### CI compares against the merge base

CI will regenerate and lint the candidate artifact, fail on an uncommitted diff, and run a pinned
OpenAPI compatibility checker against the merge-base artifact. A breaking change requires an
explicit major-version proposal; suppressions are scoped, documented and time-bounded.

### Problem Details has one response boundary

A central mapper converts known domain, authorization, validation and dependency errors to RFC 9457. The response always sets `application/problem+json` and includes an absolute stable `type`,
`title`, HTTP `status`, safe `detail`, request `instance`, machine-readable `code`, and
`correlationId`. Validation failures additionally include sanitized field errors.

Unknown errors are logged with the correlation ID and returned as a generic 500 problem. Route
handlers may classify domain errors, but do not manually shape the response body.

### CORS is allowlist-only

`CORS_ALLOWED_ORIGINS` is parsed and normalized at startup. Production and shared environments
fail closed when it is absent or malformed. Local development receives a documented default list
of loopback frontend origins; tests inject their own list. The server never uses unrestricted
origin reflection.

## Risks / Trade-offs

- Describing all current routes is sizable work. Migrate domain groups in bounded batches, while
  CI prevents new undocumented routes from being added.
- Stricter CORS can expose missing deployment configuration. Validate every deployed environment
  before rollout and retain a documented rollback variable.
- Clients may inspect the old problem `type` slug. Keep compatibility telemetry and publish the
  URI/code mapping before enforcement.

## Migration Plan

1. Introduce shared schemas, generator and contract tests.
2. Migrate public route groups and record the baseline artifact.
3. Enable lint and no-diff CI gates.
4. Enable breaking-change comparison.
5. Deploy explicit CORS configuration before removing reflection.
6. Enable the central problem handler and monitor problem codes.

Rollback restores the previous handler/CORS configuration while retaining additive schemas and
the generated artifact.
