# Verificación — SPEC-132

## Criterios

### CAD-132-01 — CashRegistered fija nombre canónico, timing y deprecación del alias legado

- [ ] nombre canónico y legado no publicable quedan congelados.

### CAD-132-02 — Cada CashMovement aceptado emite un único hecho lógico

- [ ] cada movimiento lógico aceptado emite un único hecho observable.

### CAD-132-03 — Envelope y payload exponen IDs, amount y revisión de ledger suficientes

- [ ] el payload expone IDs, tipo, dirección, monto, timing y revisión suficientes.

### CAD-132-04 — El payload excluye PII, texto libre y datos sensibles no necesarios

- [ ] el evento omite PII y texto libre no necesario.

### CAD-132-05 — EventId y source identity evitan doble contabilización

- [ ] retry, dedupe y reorder no duplican contabilización económica.

### CAD-132-06 — La aprobación exige evidencia de rollback, compensaciones y evolución

- [ ] fixtures cubren rollback, compensaciones, evolución y cross-tenant.
