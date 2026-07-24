# Objetivo — SPEC-040

## Propósito

Administrar drafts, revisiones y publicación de `Menu` mediante comandos concurrentes e idempotentes,
sin editar snapshots publicados ni borrar historia.

## Criterios de aceptación

### CAD-040-01 — Create, list y get derivan tenant del contexto y validan Brand/alcances

Create/list/get derivan tenant del contexto y validan Brand/alcances sin revelar recursos
de otro tenant.

### CAD-040-02 — Create produce DRAFT idempotente y no publica contenido parcial

Create produce DRAFT idempotente con currency/alcances/versión y no publica contenido parcial.

### CAD-040-03 — PATCH exige `If-Match` y sólo modifica DRAFT

PATCH exige `If-Match` y sólo modifica DRAFT; PUBLISHED permanece inmutable.

### CAD-040-04 — Publish valida snapshot completo, es idempotente y mueve el puntero activo atómicamente

Publish valida snapshot completo, es idempotente y mueve el puntero activo atómicamente; error deja
el puntero anterior.

### CAD-040-05 — Archive es un comando auditado y no existe eliminación física

Archive es comando auditado, conserva revisiones/orders y no existe eliminación física.

### CAD-040-06 — Cursor, filtros, orden, estados HTTP, RBAC, auditoría y OpenAPI poseen evidencia de concurrencia

Cursor/filtros/orden, 404/409/412/422, RBAC, auditoría y OpenAPI poseen evidencia de alcances, doble
publish y concurrencia.
