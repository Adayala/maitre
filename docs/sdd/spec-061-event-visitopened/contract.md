# Contrato del evento — SPEC-061

`floor.visit.opened.v1`, aggregate Visit, emitido por outbox tras apertura. Payload mínimo:
tenantId, branchId, visitId, serviceId, guestCount, tableIds, reservationId opcional,
openedAt y aggregate revision. Sin datos de contacto. Delivery al menos una vez;
consumidores deduplican y no usan el evento como autorización. Tests cubren atomicidad,
duplicates, ordering, payload mínimo y cross-tenant routing.
