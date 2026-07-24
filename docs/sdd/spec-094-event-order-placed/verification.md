# Verificación — SPEC-094

## Criterios

### CAD-094-01 — El nombre canónico y la deprecación de `OrderPlaced` quedan congelados

- [ ] nombre canónico y deprecación de `OrderPlaced` quedan congelados.

### CAD-094-02 — El evento se emite una vez por submit lógico aprobado

- [ ] cada submit lógico emite un único hecho observable.

### CAD-094-03 — Envelope y payload exponen scope, revisión y totales resumidos suficientes

- [ ] envelope/payload exponen scope, revisión y totales resumidos suficientes.

### CAD-094-04 — El payload excluye PII, notas y datos no necesarios

- [ ] payload omite PII, notas y datos no necesarios.

### CAD-094-05 — Rollback, retry y reorder convergen con outbox y dedupe

- [ ] rollback, retry y reorder convergen con outbox y dedupe.

### CAD-094-06 — La aprobación exige evidencia de rollback, evolución y correlación

- [ ] fixtures cubren duplicate submit, correlación y cross-tenant.
