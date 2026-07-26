# Contrato del evento — SPEC-077

`reservations.reservation.confirmed.v1` representa una reservation ya confirmada. Incluye
`reservationId`, `branchId`, horario/duración, `partySize`, `tableIds` opcional, `confirmedAt`
y `aggregateRevision`; sin contacto. I0 no publica `capacityAllocationId`, `timezone` ni una
entidad aparte de capacity allocation. Consumidores convergen por revision y no interpretan el
evento como permiso para mutar capacidad. Tests cubren nombre de evento y payload mínimo emitido.
