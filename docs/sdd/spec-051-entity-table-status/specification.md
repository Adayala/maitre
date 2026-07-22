# Especificación — SPEC-051 TableStatus

Proyección no editable con `status`, reason, related resource, source revisions y `asOf`.
Precedencia: BLOCKED > OCCUPIED/PAYING > CLEANING > RESERVED > AVAILABLE.

RESERVED sólo aplica dentro de `[reservation.startAt - holdBefore,
reservation.startAt + graceAfter)` según CapacityPolicyVersion, para la reserva confirmada de mayor
prioridad compatible. NO_SHOW/CANCELLED/EXPIRED libera en la transacción autoritativa. Una Occupancy
ACTIVE siempre prevalece. Mutaciones nunca confían en esta proyección y revalidan fuentes.
