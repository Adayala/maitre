> Historial de implementación migrado al árbol SDD; SPEC-221 es la fuente normativa vigente.

## Context

Adapter selection is currently inferred independently by persistence and authentication. Missing
credentials select `memory` and `fixture`, which is useful locally but unsafe in a serverless or
shared deployment.

## Decisions

The API resolves environment, persistence and authentication once. `APP_ENV` has precedence and
provider `VERCEL_ENV` is the fail-safe fallback. Only `local`, `test` and `e2e` may use ephemeral
adapters. Every other environment must explicitly select both Supabase drivers and provide the
credentials required by the current PostgREST adapter.

The Vercel workflow validates its downloaded production environment before deployment. The
preflight parses the file without evaluating shell syntax and reports only sanitized capability
flags.

This gate does not claim that the authoritative E2E uses durable persistence. Ephemeral
Supabase/PostgreSQL provisioning, migrations from zero, RLS and cleanup remain separate evidence.

## Risks

- Existing shared projects without explicit driver variables will stop deploying. This is the
  intended fail-closed behavior.
- The current Supabase persistence adapter uses a privileged server credential. It remains
  server-only; a least-privilege SQL adapter is future hardening.
