# Objetivo — SPEC-094

Definir el evento normativo de submit de Order con naming canónico, idempotencia lógica y payload
mínimo no sensible.

## Criterios de aceptación

### CAD-094-01 — El nombre canónico y la deprecación de `OrderPlaced` quedan congelados

el nombre canónico, la deprecación de `OrderPlaced` y el versionado del contrato quedan
definidos sin ambigüedad.

### CAD-094-02 — El evento se emite una vez por submit lógico aprobado

el evento se emite exactamente una vez por transición lógica de submit aprobada.

### CAD-094-03 — Envelope y payload exponen scope, revisión y totales resumidos suficientes

envelope y payload incluyen scope, revisión, timestamps y totales resumidos suficientes
para consumidores autorizados.

### CAD-094-04 — El payload excluye PII, notas y datos no necesarios

el payload excluye PII, notas libres y datos no necesarios para integración.

### CAD-094-05 — Rollback, retry y reorder convergen con outbox y dedupe

rollback, retry y reordenamiento convergen mediante outbox y deduplicación.

### CAD-094-06 — La aprobación exige evidencia de rollback, evolución y correlación

La aprobación exige fixtures de rollback, duplicate submit, evolución compatible,
correlación y aislamiento.
