# Especificación — SPEC-062 VisitClosed

`floor.visit.closed.v1` sólo se produce cuando Visit pasa `CLOSING → CLOSED` después de
validar Check/Payments/Kitchen y cerrar Occupancies en la misma transacción. Incluye envelope
SPEC-217, `visitId`, `branchId`, `servicePeriodId?`, `closedAt`, `checkId`,
`checkRevision` y `aggregateRevision`; omite importes, Payment detail, line items y PII.

`floor.visit.reopened.v1` sólo se produce por workflow correctivo manager confirmado. Incluye
el mismo scope, `visitId`, `previousClosedRevision`, `reasonCode` catalogado, `reopenedAt` y
nueva `aggregateRevision`; texto libre permanece sólo en auditoría autorizada. Ambos usan
partition key `visitId`. Reopen no elimina, reemplaza ni invalida el evento closed anterior.
