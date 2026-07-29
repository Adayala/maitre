# Contrato API — SPEC-057 Table Status

`GET /v1/branches/{branchId}/table-statuses` devuelve la proyección calculada live para todas las
mesas de la sucursal con `tableId`, `status`, `relatedVisitId?`, `relatedReservationId?` y `asOf`.
También conserva mesas referenciadas por Visits históricos aunque el catálogo de mesas no las
devuelva, para tolerar datos legados.

`GET /v1/tables/{id}/status` usa el mismo projector y envelope `{ data }`. La implementación
soporta `AVAILABLE`, `RESERVED`, `OCCUPIED` y `PAYING`; la reserva se aplica sólo dentro de su
ventana autoritativa y nunca prevalece sobre una ocupación activa. Tests API cubren ambos
endpoints y la app Floor verifica visualización, filtros y apertura de visita mediante Playwright.
Cache push/realtime, conditional GET y las fuentes operativas para `BLOCKED/CLEANING` siguen
diferidos.
