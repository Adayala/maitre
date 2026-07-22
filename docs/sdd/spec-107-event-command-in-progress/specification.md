# Especificación — SPEC-107 CommandInProgress

`kitchen.command.in-progress.v1` se emite en la transición efectiva `CLAIMED -> IN_PROGRESS`, no al
claim. Incluye envelope SPEC-217, command/ticket/order allocation, station, owner actor reference,
startedAt y aggregate revision; omite PII. Reintentos no generan otro hecho lógico y una
transferencia posterior se representa con evento separado.
