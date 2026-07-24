# Objetivo — SPEC-027

## Propósito

Representar el acuerdo vigente de servicios solicitado por un Tenant sin convertir Subscription en
factura, credencial ni fuente directa de autorización.

## Criterios de aceptación

### CAD-027-01 — Cada Subscription pertenece a un único Tenant y existe como máximo una vigente por contexto

Cada Subscription pertenece a un único Tenant y existe como máximo una vigente por contexto
comercial.

### CAD-027-02 — El lifecycle permite `TRIAL → ACTIVE → SUSPENDED → CANCELLED`

Lifecycle permite `TRIAL → ACTIVE → SUSPENDED → CANCELLED`; transiciones registran actor, motivo,
versión y período.

### CAD-027-03 — `CANCELLED` es terminal y reactivación crea nueva Subscription

`CANCELLED` es terminal; reactivación crea nueva Subscription y preserva historia.

### CAD-027-04 — Los items referencian service codes y catalog versions aprobados

Items referencian service codes/catalog versions aprobados; nombres de planes comerciales no se
hardcodean como autoridad.

### CAD-027-05 — Suspender o cancelar no borra datos ni ejecuta cobros

Suspender/cancelar no borra datos ni ejecuta cobros; SPEC-035 recalcula capacidad efectiva conforme a
policy.

### CAD-027-06 — Unicidad, períodos, concurrencia, aislamiento y ausencia de side effects de billing poseen evidencia

Unicidad, períodos, concurrencia, aislamiento y ausencia de side effects de billing poseen evidencia
contractual.
