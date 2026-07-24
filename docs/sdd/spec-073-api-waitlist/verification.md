# Verificación — SPEC-073

## Criterios

### CAD-073-01 — La API de waitlist delimita rutas, comandos y scope de Branch

- [ ] OpenAPI contiene sólo superficie/schemas/permissions aprobados.

### CAD-073-02 — Add y comandos son idempotentes; list sigue orden autoritativo

- [ ] retry, cursor, ties y aging son deterministas y evitan starvation.

### CAD-073-03 — Notify crea intención desacoplada sin tomar capacidad

- [ ] notify duplicado crea una intención y cero Holds.

### CAD-073-04 — Seat coordina Allocation y Visit con un único ganador concurrente

- [ ] seat concurrente crea una Visit/Allocation o rollback total.

### CAD-073-05 — Priority override exige control explícito y nunca usa PII

- [ ] override respeta permission/reason/expiry/límite y no filtra PII.

### CAD-073-06 — La aprobación exige evidencia de fairness, retry y aislamiento

- [ ] terminales, rate limit, auditoría, outbox y aislamiento poseen evidencia.
