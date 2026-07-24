# Verificación — SPEC-068

## Criterios

### CAD-068-01 — WaitlistEntry conserva scope, secuencia y política de orden aplicadas

- [ ] scope, partySize, sequence, contacto y policy inválidos se rechazan.

### CAD-068-02 — El lifecycle de waitlist es inequívoco y auditado

- [ ] matriz lifecycle/terminales es completa e idempotente.

### CAD-068-03 — La política de orden produce una cola estable y auditable

- [ ] ordering, desempates, aging y override son reproducibles.

### CAD-068-04 — Estimate y notify no consumen ni prometen capacidad

- [ ] notify/estimate nunca crean capacidad y respetan consent.

### CAD-068-05 — Seating desde waitlist coordina capacidad y Visit atómicamente

- [ ] seats concurrentes producen un único Allocation/Visit o rollback total.

### CAD-068-06 — La aprobación exige evidencia de fairness, consentimiento y aislamiento

- [ ] expiración, redacción, auditoría y aislamiento poseen evidencia.
