# Rules — SPEC-046

- Autenticación no basta: permiso/alcance determinan items visibles.
- Estado se deriva de fuentes autoritativas; no se marca manualmente.
- Item usa code/status/reasons/action ref canónicos.
- Unavailable/partial/stale son explícitos y no equivalen a cero/incompleto.
- Cache sólo es válida con revision/freshness; TTL exacto requiere medición/policy.
- Action refs están allowlisted y no amplían autorización.
