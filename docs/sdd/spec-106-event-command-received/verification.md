# Verificación — SPEC-106

## Criterios

### CAD-106-01 — El evento `command.received` fija nombre, timing y fan-out sin ambigüedad

- [ ] nombre canónico y fan-out por Command quedan congelados.

### CAD-106-02 — Cada creación lógica RECEIVED emite un único hecho por unidad

- [ ] cada ingreso lógico RECEIVED emite un único hecho por unidad.

### CAD-106-03 — Envelope y payload exponen routing, prioridad y revisiones suficientes

- [ ] payload expone routing, prioridad, timestamps y revisiones suficientes.

### CAD-106-04 — El payload excluye PII, precios y notas libres no necesarias

- [ ] payload omite PII, precios y notas libres.

### CAD-106-05 — Rollback, retry y reorder convergen con outbox y dedupe

- [ ] rollback, retry y reorder convergen con outbox y dedupe.

### CAD-106-06 — La aprobación exige evidencia de fan-out, retry y evolución

- [ ] fixtures cubren fan-out, correlación, evolución y cross-tenant.
