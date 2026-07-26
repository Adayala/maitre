# Especificación — SPEC-057 Table Status API

Superficie I0:

- `GET /v1/branches/{branchId}/table-statuses`;
- `GET /v1/tables/{tableId}/status`.

La colección I0 actual no acepta filtros ni cursor. Devuelve una proyección mínima por mesa:
`tableId`, `status`, `relatedVisitId?` y `asOf`. Sólo puede derivar `OCCUPIED` y `PAYING` para
mesas actualmente referenciadas por Visits del Branch; mesas sin Visits activas hoy no se incluyen
en la colección. `BLOCKED`, `CLEANING`, `RESERVED` y una colección completa con `AVAILABLE`
siguen diferidos.

`GET /v1/tables/{tableId}/status` todavía convive como placeholder heredado de SPEC-012: no usa la
misma proyección rica y sólo responde `{status, occupancy}` con lógica simplificada. No hay
conditional GET ni freshness estructurada todavía. Toda acción sugerida sigue yendo a APIs de
command que revalidan estado; esta vista no realiza writes.
