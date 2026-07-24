# Especificación — SPEC-051 TableStatus

Proyección no editable con `status`, reason, related resource, source revisions y `asOf`.
Precedencia: BLOCKED > PAYING > OCCUPIED > CLEANING > RESERVED > AVAILABLE. `PAYING`
requiere Occupancy ACTIVE y Visit `CLOSING`; de otro modo esa ocupación produce `OCCUPIED`.

RESERVED sólo aplica dentro de `[reservation.startAt - holdBefore,
reservation.startAt + graceAfter)` según CapacityPolicyVersion, para la reserva confirmada de mayor
prioridad compatible. NO_SHOW/CANCELLED/EXPIRED libera en la transacción autoritativa. Una Occupancy
ACTIVE siempre prevalece. Mutaciones nunca confían en esta proyección y revalidan fuentes.
La lectura declara revisiones fuente y frescura. Una caché es opcional: no puede ocultar
staleness, retroceder revisiones ni definir por sí misma el estado.
