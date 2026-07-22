# Especificación — SPEC-068 WaitlistEntry

Lifecycle `WAITING -> NOTIFIED -> SEATED`; WAITING/NOTIFIED pueden CANCELLED/EXPIRED. Notify no crea
hold. Seat adquiere CapacityAllocation y Visit atómicamente.

OrderingPolicyVersion ordena por band, party size compatible, arrival sequence e ID. Bands usan
reason codes allowlisted; atributos sensibles/texto no alteran prioridad. Override exige permiso,
actor, reason, expiry y límite. Aging impide starvation. Cambiar orden no edita `arrivedAt`.
