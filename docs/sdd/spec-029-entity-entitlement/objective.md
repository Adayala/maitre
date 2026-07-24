# Objetivo — SPEC-029

## Propósito

Representar la capacidad efectiva y tipada derivada de Subscription, items y overrides aprobados,
sin permitir edición CRUD o ampliación por cache stale.

## Criterios de aceptación

### CAD-029-01 — La identidad lógica es tenant + entitlement code + scope y el code/type existe en catálogo

La identidad lógica es tenant + entitlement code + scope y el code/type existe en catálogo versionado.

### CAD-029-02 — El valor efectivo enlaza fuentes, revision de cálculo, vigencia y computedAt

Valor efectivo enlaza fuentes, revision de cálculo, vigencia y computedAt.

### CAD-029-03 — Recomputation es idempotente y reemplaza la proyección atómicamente

Recomputation es idempotente y reemplaza la proyección atómicamente.

### CAD-029-04 — Fuentes inválidas, expiradas o cache stale nunca amplían capacidad

Fuentes inválidas/expiradas o cache stale nunca amplían capacidad; privileged capability falla
cerrado.

### CAD-029-05 — Override requiere autoridad, razón, vigencia y auditoría

Override requiere autoridad, razón, vigencia y auditoría; no edita el Entitlement derivado
directamente.

### CAD-029-06 — Reducción, expiración, scopes, invalidación y aislamiento poseen evidencia

Reducción, expiración, scopes, invalidación y aislamiento poseen evidencia.
