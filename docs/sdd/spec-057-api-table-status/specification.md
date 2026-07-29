# Especificación — SPEC-057 Table Status API

Superficie I0:

- `GET /v1/branches/{branchId}/table-statuses`;
- `GET /v1/tables/{tableId}/status`.

La colección I0 actual no acepta filtros ni cursor. Devuelve una proyección por cada mesa de la
sucursal:
`tableId`, `status`, `relatedVisitId?` y `asOf`. Sólo puede derivar `OCCUPIED` y `PAYING` para
mesas actualmente ocupadas, `RESERVED` para reservas confirmadas/asentadas en su ventana y
`AVAILABLE` para el resto. `BLOCKED` y `CLEANING` siguen diferidos hasta materializar comandos
operativos para esos estados.

`GET /v1/tables/{tableId}/status` usa el mismo proyector y envelope `{data}` que la colección. No
hay conditional GET todavía. Toda acción sugerida sigue yendo a APIs de command que revalidan
estado; esta vista no realiza writes.
