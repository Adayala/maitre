# Objetivo — SPEC-080

Definir permisos canónicos para reservas, waitlist, Guest PII y capabilities públicas.

## Criterios de aceptación

### CAD-080-01 — Cada operación de reservas mapea a un permiso exacto

Cada operación SPEC-071–075 mapea a un permiso exacto, sin manage/wildcard.

### CAD-080-02 — La autorización combina membership, permiso, alcance y revisión vigentes

Se validan Membership ACTIVE, permiso, tenant, sucursal/assignment y revisión.

### CAD-080-03 — Los labels de rol no otorgan autoridad por sí mismos

MAITRE/MANAGER/WAITER son perfiles de assignments, no autoridad nominal.

### CAD-080-04 — Las acciones sobre PII y operaciones sensibles tienen controles dedicados

PII, merge, export/anonymize, overrides y bulk tienen controles separados.

### CAD-080-05 — Las capabilities públicas son opacas y no equivalen a membership

capabilities son opacas, hasheadas, acotadas, expirables y no son Membership.

### CAD-080-06 — La aprobación exige evidencia de allow/deny, no enumeración y aislamiento

La aprobación exige allow/deny, self-grant, replay, autorización desactualizada, no enumeración y
aislamiento.
