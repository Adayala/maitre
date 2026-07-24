# Objetivo — SPEC-034

## Propósito

Publicar la desactivación confirmada de un SubscriptionItem para invalidar capacidad futura sin
borrar datos ni interrumpir operaciones en curso fuera de sus contratos.

## Criterios de aceptación

### CAD-034-01 — Una transición confirmada a INACTIVE produce `subscription.service.deactivated.v1`

Una transición confirmada a INACTIVE produce una intención lógica `subscription.service.deactivated.v1`
para `SubscriptionItem/itemId`.

### CAD-034-02 — Item y outbox se confirman atómicamente

Item y outbox se confirman atómicamente; retry físico conserva eventId.

### CAD-034-03 — El payload incluye refs, scopes, effectiveAt, reasonCode y revisions sin datos sensibles

Payload incluye refs, scopes afectados, effectiveAt, reasonCode y revisions, sin texto sensible,
precio, pago o PII.

### CAD-034-04 — Consumidores invalidan y recalculan idempotentemente

Consumidores invalidan/recalculan idempotentemente y convergen ante duplicados/reordenamiento con
activated.

### CAD-034-05 — Nuevas acciones fallan cerrado según Entitlement efectivo

Nuevas acciones fallan cerrado según Entitlement efectivo; cleanup/retención y operación en curso
siguen contratos propios, no este evento.

### CAD-034-06 — Schema, atomicidad, ordering, retry, DLQ, redacción y compatibilidad poseen evidencia

Schema, atomicidad, ordering, retry/DLQ, redacción y compatibilidad poseen evidencia contractual.
