# Objetivo — SPEC-180

Definir la API de estado de conectores como read model derivado, sin side effects ni health checks en
lectura.

## Criterios de aceptación

### CAD-180-01 — El read model publica configured state, credenciales, freshness, lag y errors

el read model expone por integration/capability configured state, credential state, last
success/attempt, freshness, checkpoint lag, quota, degradation y normalized errors con
`asOf`.

### CAD-180-02 — La lectura no ejecuta checks de red ni muta estado

la lectura no ejecuta network checks ni muta estado externo/interno.

### CAD-180-03 — Provider details sensibles y secret refs se redactan según permiso

details sensibles del provider, subjects y secret refs se redactan según permiso.

### CAD-180-04 — Degraded, `UNKNOWN` y `STALE` no se presentan como healthy

el estado global deriva degradación parcial correctamente; `UNKNOWN` o `STALE` nunca se
presentan como healthy.

### CAD-180-05 — Cache scope aísla tenant y permisos

cache scope incluye tenant y permisos para evitar sobreexposición entre actores.

### CAD-180-06 — La aprobación exige evidencia de degradación parcial, stale y cache isolation

La aprobación exige fixtures de degradación parcial, stale/unknown, redaction, cache
isolation y normalized errors.
