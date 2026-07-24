# Objetivo — SPEC-068

## Propósito

WaitlistEntry representa un grupo esperando capacidad en una Branch, con orden explicable y
sin convertir una notificación o estimación en reserva.

## Resultado esperado

### CAD-068-01 — WaitlistEntry conserva scope, secuencia y política de orden aplicadas

Cada entry identifica scope, partySize, Guest/contacto mínimo opcional, arrival sequence,
policy version y revisión.

### CAD-068-02 — El lifecycle de waitlist es inequívoco y auditado

lifecycle distingue WAITING, NOTIFIED, SEATED, CANCELLED y EXPIRED con
timestamps/reasons inequívocos.

### CAD-068-03 — La política de orden produce una cola estable y auditable

OrderingPolicyVersion produce orden total estable, aging y overrides auditados sin
atributos sensibles.

### CAD-068-04 — Estimate y notify no consumen ni prometen capacidad

estimate es informativo y notify no crea Hold ni garantiza capacidad.

### CAD-068-05 — Seating desde waitlist coordina capacidad y Visit atómicamente

seat adquiere Allocation y Visit atómicamente, idempotente y tras revalidar capacidad.

### CAD-068-06 — La aprobación exige evidencia de fairness, consentimiento y aislamiento

La aprobación exige fixtures de orden, starvation, carreras, expiración, consentimiento,
redacción y aislamiento.
