# Especificación — SPEC-057 Table Status API

Superficie I0:

- `GET /v1/branches/{branchId}/table-statuses`;
- `GET /v1/tables/{tableId}/status`.

La colección acepta únicamente `salonId`, status del catálogo, cursor y limit acotado. Devuelve
status/reason, related ref redactada, source revisions, cursor, `asOf` y freshness. Admite
conditional GET y polling; cualquier canal realtime se rige por SPEC-223 y no agrega writes.

Stale/lag/gap se declara y dispara refetch cuando corresponde. Filtros no permiten inferir Guest.
Toda acción sugerida lleva a command API que
revalida Occupancy/Reservation/blocks; nunca muta basado en esta vista.
