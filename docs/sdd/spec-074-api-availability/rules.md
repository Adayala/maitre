# Reglas — SPEC-074

- Availability es query, no hold ni garantía.
- Devuelve `asOf`, freshness, timezone y policy version.
- No expone Reservation/Guest ni reasons identificables.
- Confirm siempre revalida CapacityAllocation autoritativa.
- En I0, la capacidad disponible deriva de mesas individuales, no de la capacidad declarada del
  salón. Una sucursal con salones activos pero sin mesas devuelve `available: false` y
  `freeTableIds: []`.
- Query no acepta datos sensibles ni texto libre en URL.
- Cache key incluye scope, inputs y todas las policy/input revisions; stale/gap queda explícito.
- `404` oculta Branch, `422` valida calendario/partySize y `429` aplica rate policy.
- La granularidad y reason catalog no permiten reconstruir Reservations individuales.
