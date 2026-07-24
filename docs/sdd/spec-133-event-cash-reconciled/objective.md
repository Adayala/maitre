# Objetivo — SPEC-133

Definir el evento normativo de reconciliación aprobada de caja con payload agregado y comportamiento
estable frente a ajustes tardíos.

## Criterios de aceptación

### CAD-133-01 — CashReconciled fija nombre, timing y separación frente a submit/reject

nombre canónico, momento de emisión y diferencia frente a submit/reject quedan definidos
con claridad.

### CAD-133-02 — Cada aprobación lógica emite un único hecho observable

cada aprobación lógica de CashReconciliation emite un único hecho observable.

### CAD-133-03 — Envelope y payload exponen expected/counted/difference suficientes

envelope/payload incluyen session/reconciliation, currency, expected, counted, difference,
timestamps y revision suficientes.

### CAD-133-04 — El evento omite evidencia sensible y no se reemite por ajustes tardíos

el evento omite evidencia sensible y no se reemite por late adjustments posteriores.

### CAD-133-05 — Retries, rollback y reorder convergen con outbox y dedupe

retries, rollback y reorder convergen con outbox y dedupe.

### CAD-133-06 — La aprobación exige evidencia de rechazo previo, ajustes tardíos y evolución

La aprobación exige fixtures de rechazo previo, aprobación repetida, ajustes tardíos,
evolución y aislamiento.
