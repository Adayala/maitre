# Contrato de evento — SPEC-095 OrderItemReady / OrderReady

Publicar `ordering.order.ready.v1` únicamente cuando la derivación agregada alcanza READY. I0 no
publica `ordering.order-item.ready.v1`. Cada hecho tiene una única emisión lógica aunque existan
reintentos. El envelope incluye IDs/revisiones y referencias operativas mínimas, sin PII ni
notas. Tests cubren transición agregada a READY, duplicados lógicos, correlación y deduplicación.
