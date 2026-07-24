# Structure — SPEC-066

Estructura lógica:

- Reservation: `reservationId`, tenant/Branch, `guestId?`, `[startAt,endAt)`, timezone,
  partySize, source/channel, status, `allocationId?`, `visitId?`, policy versions,
  terminal reason/timestamps, revision y auditoría.
- CapacityHold/Allocation: identidad, tenant/Branch, Reservation, intervalo, partySize,
  unidades o pool/policy referenciados, `HELD | CONFIRMED | RELEASED | EXPIRED`,
  `expiresAt?` y revision.

Preferencias se referencian o congelan como snapshot tipado; contacto y notas sensibles no
se duplican. La persistencia debe imponer exclusión/capacidad y unicidad del vínculo Visit.
