# Especificación — SPEC-108 CommandReady / CommandCompleted

`kitchen.command.ready.v1` se emite al terminar producción. `kitchen.command.completed.v1` se emite
al confirmar retiro/handoff. No son sinónimos y ninguno significa entrega al Guest.

Payloads incluyen envelope SPEC-217, command/ticket/order allocation, station, actor type,
readyAt o completedAt y aggregate revision. Los eventos por Command permiten parciales; OrderReady
se deriva aparte. Reintentos y eventos tardíos convergen por ID/revision.
