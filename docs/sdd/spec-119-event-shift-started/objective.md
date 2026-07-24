# Objetivo — SPEC-119

Definir el evento normativo de inicio administrativo de WorkShift con separación clara respecto de
clock-in individual y payload agregado privacy-safe.

## Criterios de aceptación

### CAD-119-01 — ShiftStarted fija nombre, timing y separación frente al primer clock-in

nombre canónico, momento exacto de emisión y diferencia frente a primer clock-in quedan
definidos sin ambigüedad.

### CAD-119-02 — Cada transición lógica `PUBLISHED -> IN_PROGRESS` emite un único hecho

cada transición lógica `PUBLISHED -> IN_PROGRESS` emite un único hecho observable.

### CAD-119-03 — Envelope y payload exponen intervalo, policy y revisión suficientes

envelope y payload incluyen scope, intervalo planificado, startedAt, policy y revisión
suficientes para downstreams autorizados.

### CAD-119-04 — El evento excluye fichadas individuales, Employment IDs y remuneración

el evento excluye fichadas individuales, Employment IDs, remuneración y agregados que
rompan privacy threshold.

### CAD-119-05 — Retries, rollback y reorder convergen con outbox y dedupe

retries, rollback y reorder convergen mediante outbox y deduplicación.

### CAD-119-06 — La aprobación exige evidencia de inicio administrativo, privacidad y evolución

La aprobación exige fixtures de inicio administrativo, rollback, duplicados, privacidad,
evolución y aislamiento.
