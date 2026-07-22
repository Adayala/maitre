# Especificación — SPEC-104 Production API

`GET /stations/{id}/production` devuelve ProductionQueue con cursor, revision, `asOf` y freshness.
Los commands operativos delegan a SPEC-102 y validan contra Command, nunca contra la proyección.

Un KDS stale puede seguir mostrando datos con indicador degradado, pero debe reconsultar antes de
mutar. Claim concurrente permite un solo owner. Hold requiere reason y resume vuelve a IN_PROGRESS.
Ready y complete-handoff son hechos distintos y no equivalen a delivery al Guest.
