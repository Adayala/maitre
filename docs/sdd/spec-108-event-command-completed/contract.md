# Contrato de evento — SPEC-108 CommandReady / CommandCompleted

Publicar `kitchen.command.ready.v1` al terminar producción y
`kitchen.command.completed.v1` al confirmar retiro/handoff. Ninguno implica entrega al Guest.
Cada evento refiere una unidad Command y permite avance parcial; el envelope incluye IDs,
timestamps y revisions sin PII. Tests cubren finalización parcial, duplicados, rollback
excepcional, eventos tardíos, compatibilidad, correlación y aislamiento.
