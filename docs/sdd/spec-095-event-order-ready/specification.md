# Especificación — SPEC-095 OrderItemReady / OrderReady

`ordering.order-item.ready.v1` se emite por cada allocation que alcanza READY e incluye order ID,
item/allocation ID, station, readyAt y revisiones. Permite preparación parcial sin afirmar que la
orden completa está lista.

`ordering.order.ready.v1` se emite sólo cuando la derivación de SPEC-081 cambia a READY; incluye
las revisions que justifican el agregado. Ambos usan outbox/envelope SPEC-217, omiten PII/notas y
son idempotentes por transición lógica.
