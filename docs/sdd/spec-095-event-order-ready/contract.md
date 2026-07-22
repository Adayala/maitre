# Contrato de evento — SPEC-095 OrderItemReady / OrderReady

Publicar `ordering.order-item.ready.v1` por allocation preparada y
`ordering.order.ready.v1` únicamente cuando la derivación agregada alcanza READY. Cada hecho tiene
una única emisión lógica aunque existan reintentos. El envelope incluye IDs/revisiones y
referencias operativas mínimas, sin PII ni notas. Tests cubren preparación parcial, duplicados,
eventos tardíos, compatibilidad, correlación y deduplicación.
