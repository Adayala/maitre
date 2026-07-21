# Contrato del evento — SPEC-033

Evento `subscription.service.activated.v1`, aggregate SubscriptionItem, publicado por outbox
tras activación confirmada. Payload mínimo: tenantId, subscriptionId, itemId, serviceCode,
scopes, effectiveAt y calculation revision; sin precio, pago ni PII.

Delivery al menos una vez, consumidores idempotentes por eventId. El evento informa cambio
de fuente, no sustituye consulta/autorización de entitlement. Tests cubren atomicidad,
duplicados, orden, scopes, retry/DLQ y compatibilidad.
