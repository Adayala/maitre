# Objetivo — SPEC-132

Definir el evento normativo de cash movement registrado con naming canónico, payload mínimo y
deduplicación económica por source identity.

## Criterios de aceptación

### CAD-132-01 — CashRegistered fija nombre canónico, timing y deprecación del alias legado

nombre canónico, deprecación del alias legado y momento de emisión quedan definidos sin
ambigüedad.

### CAD-132-02 — Cada CashMovement aceptado emite un único hecho lógico

cada CashMovement aceptado, incluido compensatorio, emite un único hecho lógico.

### CAD-132-03 — Envelope y payload exponen IDs, amount y revisión de ledger suficientes

envelope/payload incluyen register/session/movement, type, direction, amount, currency,
timing y revisión de ledger suficientes.

### CAD-132-04 — El payload excluye PII, texto libre y datos sensibles no necesarios

el payload excluye PII, texto libre y datos sensibles no necesarios.

### CAD-132-05 — EventId y source identity evitan doble contabilización

dedupe por `eventId` y source identity evita doble contabilización bajo retry o reorder.

### CAD-132-06 — La aprobación exige evidencia de rollback, compensaciones y evolución

La aprobación exige fixtures de rollback, compensaciones, duplicados, evolución y
aislamiento.
