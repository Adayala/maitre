# Especificación — SPEC-104

`GET /v1/kitchen/stations/{id}/production-queue` devuelve la `ProductionQueue` I0 con
`stationId`, `commands` y `asOf`. Los comandos operativos delegan a SPEC-102 y validan contra
`Command`, nunca contra la proyección.

El I0 actual no expone cursor, revisión ni freshness degradada en la proyección. Claim concurrente
permite un solo owner. `hold` y `resume` son commands explícitos; `resume` vuelve a `IN_PROGRESS`.
`mark-ready` y `complete-handoff` son hechos distintos y no equivalen al delivery comercial al
Guest.
