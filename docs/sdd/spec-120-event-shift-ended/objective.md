# Objetivo — SPEC-120

Definir el evento normativo de cierre administrativo de WorkShift con separación clara respecto de
clock-out individual y controles de privacidad.

## Criterios de aceptación

### CAD-120-01 — ShiftEnded fija nombre, timing y separación frente al clock-out individual

nombre canónico, momento de emisión y diferencia frente a clock-out individual quedan
definidos con claridad.

### CAD-120-02 — Cada transición lógica a `COMPLETED` emite un único hecho

cada transición lógica a `COMPLETED` emite un único hecho observable.

### CAD-120-03 — Envelope y payload exponen outcome, policy y agregados autorizados suficientes

envelope/payload incluyen outcome, completedAt, policy/revision y agregados autorizados
suficientes.

### CAD-120-04 — Open entries bloquean cierre salvo override auditado y sin exponer fichadas

entradas abiertas bloquean el cierre salvo override auditado y el evento nunca expone
fichadas individuales o importes.

### CAD-120-05 — Retries, rollback y reorder convergen con outbox y dedupe

retries, rollback y reorder convergen por outbox y dedupe.

### CAD-120-06 — La aprobación exige evidencia de open entries, forced close y privacidad

La aprobación exige fixtures de open entries, forced close, duplicados, privacidad,
evolución y aislamiento.
