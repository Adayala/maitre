# Contrato API — SPEC-057 Table Status

`GET /v1/branches/{branchId}/table-statuses` y `GET /v1/tables/{id}/status` devuelven la
proyección SPEC-051 con revision/asOf/freshness. Soportan conditional GET y cursor; no writes.
Una respuesta stale se marca y no autoriza seating sin revalidación. Filtros salon/status
respetan branch scope. Tests cubren precedencia, cache, partial dependency, polling SPEC-223,
cross-tenant y ausencia de PII.
