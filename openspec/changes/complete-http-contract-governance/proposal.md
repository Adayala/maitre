# Change: Complete HTTP contract governance

## Why

SPEC-215 requires a versioned OpenAPI contract, RFC 9457 problem responses and an
environment-specific CORS allowlist. The API currently exposes a browsable route catalog, but it
does not persist a reviewable OpenAPI artifact, describe every public operation in enough detail
for contract comparison, or enforce those rules in CI.

## What Changes

- Generate and commit a deterministic OpenAPI 3.1 artifact from the Fastify application.
- Add schemas, security/context headers and response contracts for every public `/v1` operation.
- Add OpenAPI linting and breaking-change detection to the required CI gate.
- Centralize RFC 9457 responses with stable problem type URIs, machine codes, request instances,
  correlation IDs and structured validation errors.
- Return errors with `application/problem+json` and keep unexpected internals out of responses.
- Replace permissive origin reflection with an explicit environment-aware CORS allowlist.
- Add contract tests for OpenAPI generation, problems and CORS behavior.

## Impact

- Affected specs: SPEC-215, SPEC-219, SPEC-221 and SPEC-224.
- Affected code: `apps/api`, `packages/contracts`, root scripts and GitHub Actions.
- Compatibility: existing successful resource payloads remain compatible; error payloads gain
  stable fields and a standards-compliant media type.

