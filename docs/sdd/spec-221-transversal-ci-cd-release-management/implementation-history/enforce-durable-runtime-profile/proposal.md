> Historial de implementación migrado al árbol SDD; SPEC-221 es la fuente normativa vigente.

## Why

The API can currently auto-select in-memory persistence and fixture authentication when shared
deployment variables are absent. A successful serverless build can therefore publish an
ephemeral, synthetic runtime that loses state across instances and restarts.

## What Changes

- Resolve one explicit runtime profile before repository or auth composition.
- Permit memory/fixture adapters only in local, test and E2E environments.
- Require complete Supabase configuration in every shared environment.
- Add a sanitized deployment preflight over provider-downloaded configuration.
- Keep ephemeral database migration/RLS journey evidence as a separate release requirement.

## Impact

Misconfigured shared deployments fail before serving traffic. Local development remains
dependency-free. Existing production/preview projects must set the explicit driver variables and
server-side Supabase credential before their next deploy.
