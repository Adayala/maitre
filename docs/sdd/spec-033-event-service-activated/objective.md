# Objetivo — SPEC-033

## Propósito

Publicar la activación confirmada de un SubscriptionItem para invalidar/recalcular proyecciones sin
convertir el evento en Entitlement autoritativo ni ejecutar configuración destructiva.

## Criterios de aceptación

### CAD-033-01 — Una transición confirmada a ACTIVE produce `subscription.service.activated.v1`

Una transición confirmada a ACTIVE produce una intención lógica `subscription.service.activated.v1`
para aggregate `SubscriptionItem/itemId`.

### CAD-033-02 — Item y outbox se confirman atómicamente

Item y outbox se confirman atómicamente; retry físico conserva eventId.

### CAD-033-03 — El payload incluye refs, alcances, effectiveAt y revisions sin precio ni datos sensibles

Payload incluye tenant/subscription/item/serviceCode, alcances, effectiveAt y source/calculation
revision, sin precio, pago, PII ni config sensible.

### CAD-033-04 — Consumidores deduplican y convergen por revision

Consumidores deduplican y convergen por revision aun con duplicados o reordenamiento.

### CAD-033-05 — El evento sólo informa cambio de fuente y nunca actúa como autoridad directa

El evento sólo informa cambio de fuente; autorización/admisión consulta Entitlement/Quota efectivos.

### CAD-033-06 — Schema, atomicidad, scopes, retry, DLQ, redacción y compatibilidad poseen evidencia

Schema, atomicidad, scopes, retry/DLQ, redacción y compatibilidad poseen evidencia contractual.
