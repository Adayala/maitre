# Contrato de evento — SPEC-096 OrderDelivered

Publicar mediante outbox al confirmar la entrega de una orden completa, identificando actor,
canal y timestamp sin exponer PII. La transición es idempotente, conserva correlación con
OrderPlaced y no implica cierre automático de la cuenta. Tests cubren entrega parcial,
confirmaciones repetidas, orden cancelada, reordenamiento, evolución compatible, auditoría
y aislamiento entre tenants.
