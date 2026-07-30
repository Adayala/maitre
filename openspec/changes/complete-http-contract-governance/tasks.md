## 1. Contract foundation

- [x] 1.1 Define reusable OpenAPI schemas for authentication, tenant/branch context, success
      envelopes, pagination and RFC 9457 problems.
- [x] 1.2 Add a deterministic non-listening OpenAPI generator and commit the baseline artifact.
- [ ] 1.3 Document all public `/v1` operations with request, response, security and ownership
      metadata.

## 2. Error boundary and CORS

- [x] 2.1 Extend the problem model with stable URI types, codes, detail, instance and validation
      errors.
- [x] 2.2 Install a central Fastify error boundary and return `application/problem+json`.
- [x] 2.3 Replace unrestricted origin reflection with parsed environment allowlists and safe local
      defaults.
- [x] 2.4 Add unit/API tests for known errors, unexpected errors, validation failures and CORS
      preflight decisions.

## 3. Governance

- [x] 3.1 Add deterministic regeneration and OpenAPI lint scripts to the workspace.
- [x] 3.2 Add a pinned CI breaking-change comparison against the merge base.
- [x] 3.3 Document the review, exception and major-version process.
- [ ] 3.4 Run typecheck, API tests, artifact regeneration and strict OpenSpec validation.
