# Rules — SPEC-068

- `WAITING → NOTIFIED → SEATED`; WAITING/NOTIFIED pueden terminar CANCELLED o EXPIRED.
- Notify requiere ContactPoint/consent válido, pero no modifica capacidad.
- El orden no es FIFO simple: policy combina band allowlisted, compatibilidad de partySize,
  aging, arrivalSequence e ID como desempate.
- Cambiar prioridad nunca edita arrivedAt/sequence; override exige permission, reason y expiry.
- Estimate es rango con `asOf`/policy y no constituye SLA.
- Seat confirma Allocation, crea Visit y vincula la entry en una única transacción.
- Reintentos y eventos de notificación son deduplicables; SEATED/terminales no se reabren.
