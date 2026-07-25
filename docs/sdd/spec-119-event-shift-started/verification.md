# Verificación — SPEC-119

Estado actual: assessment inicial de especificación. El payload mínimo I0 queda alineado con la
forma actual del evento en código; agregados/privacy-threshold quedan diferidos u opcionales.

## Criterios

### CAD-119-01 — ShiftStarted fija nombre, timing y separación frente al primer clock-in

- [ ] el inicio administrativo se separa claramente de clock-ins individuales.

### CAD-119-02 — Cada transición lógica `PUBLISHED -> IN_PROGRESS` emite un único hecho

- [ ] cada transición lógica a `IN_PROGRESS` emite un único hecho observable.

### CAD-119-03 — Envelope y payload exponen intervalo, policy y revisión suficientes

- [ ] payload expone intervalo, startedAt, policy y revisión suficientes.

### CAD-119-04 — El evento excluye fichadas individuales, Employment IDs y remuneración

- [ ] el evento omite Employment IDs, fichadas y agregados inseguros.

### CAD-119-05 — Retries, rollback y reorder convergen con outbox y dedupe

- [ ] rollback, retry y reorder convergen con outbox y dedupe.

### CAD-119-06 — La aprobación exige evidencia de inicio administrativo, privacidad y evolución

- [ ] fixtures cubren privacidad, evolución, duplicados y aislamiento entre tenants.
