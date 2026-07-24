# Verificación — SPEC-027

## Criterios

### CAD-027-01 — Cada Subscription pertenece a un único Tenant y existe como máximo una vigente por contexto comercial

- [ ] unicidad vigente por Tenant se mantiene bajo concurrencia;
- [ ] cada Subscription pertenece a un único Tenant;
- [ ] no aparecen vigentes duplicadas para el mismo contexto comercial.

### CAD-027-02 — Lifecycle permite `TRIAL → ACTIVE → SUSPENDED → CANCELLED`; transiciones registran actor, motivo, versión y período

- [ ] transitions permitidas/prohibidas coinciden con lifecycle;
- [ ] actor, motivo, versión y período quedan auditados;
- [ ] transiciones fuera de contrato fallan explícitamente.

### CAD-027-03 — `CANCELLED` es terminal; reactivación crea nueva Subscription y preserva historia

- [ ] cancelación es terminal;
- [ ] reactivación crea nueva identidad;
- [ ] la historia previa se conserva.

### CAD-027-04 — Items referencian service codes/catalog versions aprobados; nombres de planes comerciales no se hardcodean como autoridad

- [ ] service codes y catalog versions referenciados existen;
- [ ] los nombres comerciales no actúan como autoridad;
- [ ] referencias desconocidas fallan cerrado.

### CAD-027-05 — Suspender/cancelar no borra datos ni ejecuta cobros; SPEC-035 recalcula capacidad efectiva conforme a policy

- [ ] suspensión/cancelación no borran datos;
- [ ] suspensión/cancelación no ejecutan cobros;
- [ ] la capacidad efectiva se recalcula según policy aprobada.

### CAD-027-06 — Unicidad, períodos, concurrencia, aislamiento y ausencia de side effects de billing poseen evidencia contractual

- [ ] períodos inválidos y cambios stale son rechazados;
- [ ] tenant isolation y auditoría poseen evidencia;
- [ ] no se disparan side effects de billing desde este agregado.
