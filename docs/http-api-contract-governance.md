# HTTP API contract governance

The generated OpenAPI 3.1 artifact at `apps/api/openapi/openapi.json` is the reviewable public
contract for `/v1`. It is generated from the same Fastify composition used at runtime.

## Local workflow

```bash
npm run openapi:generate
npm run openapi:check
npm run openapi:breaking
```

`openapi:check` rebuilds the API, regenerates the artifact, applies the contract policy and fails
when the committed artifact is stale. `openapi:breaking` compares paths, operations and component
schemas with `OPENAPI_BASE_REF`, `GITHUB_BASE_SHA` or `origin/main`.

Every public operation requires:

- a stable `operationId`;
- an owning domain and functional spec;
- an authentication declaration;
- successful and Problem Details responses;
- request/parameter/response schemas that describe the real runtime contract.

## Compatibility review

Additive optional fields and new operations are compatible. Removing operations or response
fields, changing types, narrowing accepted input, introducing required inputs or changing success
semantics is breaking.

A breaking `/v1` change is not suppressed inline. It requires:

1. an approved SDD change record explaining affected clients and migration;
2. a major API version or an approved compatibility window;
3. usage evidence and a dated deprecation notice;
4. owner and rollback plan.

The initial artifact has no historical comparison. After it lands on `main`, every candidate is
compared against that committed baseline.

## Problem Details

Errors use `application/problem+json`. Clients branch on stable `code` or absolute `type`, never
localized/detail text. `detail` and field error messages are diagnostic and may evolve while
remaining safe. Unknown errors return a generic problem; server logs retain correlation evidence.

## CORS

`CORS_ALLOWED_ORIGINS` is a comma-separated list of exact HTTP(S) origins. Shared and production
environments fail startup when the list is absent. Local/test/e2e use only the documented loopback
defaults; the API never reflects an arbitrary origin.
