# Objetivo — SPEC-106

Definir el evento normativo de ingreso de Command a producción con fan-out por unidad y payload
mínimo no sensible.

## Criterios de aceptación

### CAD-106-01 — El evento `command.received` fija nombre, timing y fan-out sin ambigüedad

nombre canónico, momento de emisión y fan-out por Command quedan definidos sin ambigüedad.

### CAD-106-02 — Cada creación lógica RECEIVED emite un único hecho por unidad

cada creación lógica de Command RECEIVED emite un único hecho observable por unidad.

### CAD-106-03 — Envelope y payload exponen routing, prioridad y revisiones suficientes

envelope/payload incluyen scope, routing, prioridad, timestamps y revisiones suficientes
para downstreams autorizados.

### CAD-106-04 — El payload excluye PII, precios y notas libres no necesarias

el payload excluye PII, precios y notas libres no necesarias.

### CAD-106-05 — Rollback, retry y reorder convergen con outbox y dedupe

rollback, retry y reorder convergen vía outbox y deduplicación.

### CAD-106-06 — La aprobación exige evidencia de fan-out, retry y evolución

La aprobación exige fixtures de fan-out, rollback, retry, evolución y aislamiento.
