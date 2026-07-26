# Contrato API — SPEC-057 Table Status

`GET /v1/branches/{branchId}/table-statuses` devuelve la proyección Floor calculada live por mesa
con `tableId`, `status`, `relatedVisitId?` y `asOf`. El I0 actual expone sólo mesas alcanzadas por
Visits del Branch y soporta efectivamente `OCCUPIED` y `PAYING`; no hay cursor, conditional GET ni
freshness estructurada.

`GET /v1/tables/{id}/status` sigue siendo un endpoint heredado y más pobre del módulo Tables,
todavía no reconciliado con la proyección branch-level. Tests cubren OCCUPIED/PAYING en la
colección y scope autenticado; cache/polling/realtime, inclusión completa de AVAILABLE y estados
BLOCKED/CLEANING/RESERVED siguen diferidos.
