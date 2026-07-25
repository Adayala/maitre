# Especificación — SPEC-089 Order Modifications API

El I0 actual expone modificaciones puntuales sobre la Order ya existente:
`POST /v1/orders/{id}/items/{itemId}/change-quantity` y
`POST /v1/orders/{id}/items/{itemId}/cancel`. `replace-modifiers` no existe todavía.
Cada cambio aplica de forma síncrona sobre `Order` y registra un `OrderAdjustment` simple.

No hay saga `PENDING/APPLIED/REJECTED/COMPENSATION_REQUIRED`: el I0 valida permiso/estado,
aplica el delta directamente en la Order y recalcula totales. La coordinación con Kitchen/Check
queda simplificada fuera de esta spec: submit crea Commands y agrega línea al Check de manera
secuencial desde la ruta.

Cancelar ítems `IN_PREP`/`READY` requiere permiso de excepción (`order:cancel_prepared`).
`change-quantity` usa `order:modify`. Nunca se reescribe el snapshot comercial original del item:
el ajuste queda auditado con `reasonCode`, `actorType`, `deltaAmountMinorUnits`, `orderItemId` y
`createdAt`.
