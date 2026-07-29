# Maitre

Maitre is a TypeScript monorepo for a multi-tenant restaurant operations platform.

## Conventions

- Node.js ESM with strict TypeScript and project references.
- Domain modules depend on ports; infrastructure is supplied by adapters/composition roots.
- Fiscal credentials and private keys never live in source control, application logs, browser
  code, or tenant database rows.
- External integrations distinguish homologation and production explicitly.
- Tests use Node's built-in test runner.
