# Especificación — SPEC-061 VisitOpened

`floor.visit.opened.v1` por outbox tras crear Visit OPEN y Occupancies iniciales atómicamente.
Envelope SPEC-217 más `visitId`, `branchId`, `servicePeriodId?`, `guestCount`, `tableIds`,
`reservationId?`, `openedAt` y `aggregateRevision`. `tableIds` es un conjunto no vacío,
ordenado y sin duplicados. Omite Guest, contacto, notas, Orders y Check.

Partition key es `visitId`; `eventId` identifica el delivery lógico, y
`aggregateRevision` debe corresponder a la revisión confirmada por create. Duplicados se
deduplican; revisión menor o igual no retrocede una proyección y un gap obliga refetch
autorizado. Consumidores no recrean Occupancy ni interpretan el evento como permiso.
