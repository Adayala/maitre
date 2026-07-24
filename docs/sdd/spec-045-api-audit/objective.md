# Objetivo — SPEC-045

## Propósito

Consultar AuditLog de forma paginada, acotada y redactada para actores autorizados, sin permitir
mutación ni export síncrono ilimitado.

## Criterios de aceptación

### CAD-045-01 — `GET /v1/audit-logs` deriva tenant/alcance server-side y requiere un permiso sensible

`GET /v1/audit-logs` deriva tenant/alcance server-side y requiere un permiso sensible; un rol ADMIN
nominal no basta.

### CAD-045-02 — Filtros están allowlisted y acotados y el orden/cursor evitan gaps o duplicados

Filtros actor/action/resource/rango están allowlisted y acotados; orden `occurredAt,id` y cursor
evitan gaps/duplicados.

### CAD-045-03 — La respuesta minimiza actor, diff y señales según permiso/clasificación

La respuesta minimiza actor/diff/señales según permiso/clasificación y nunca expone secrets, PII o
hashes internos innecesarios.

### CAD-045-04 — Retention y legal hold se reflejan sin inferir inexistencia histórica

Retention/legal hold se reflejan sin inferir que un record ausente nunca existió.

### CAD-045-05 — No existen create/update/delete ni export CSV síncrono

No existen create/update/delete ni export CSV síncrono; export futuro usa job, snapshot,
autorización, límites y evidencia propios.

### CAD-045-06 — Conditional pagination, redacción, filtros costosos, soporte cross-tenant y anti-enumeration poseen outcomes verificables

Conditional pagination, redacción, filtros costosos, soporte cross-tenant y anti-enumeration poseen
outcomes verificables.
