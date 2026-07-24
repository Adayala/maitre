# Verificación — SPEC-133

## Criterios

### CAD-133-01 — CashReconciled fija nombre, timing y separación frente a submit/reject

- [ ] aprobación de reconciliation y otros estados quedan bien separados.

### CAD-133-02 — Cada aprobación lógica emite un único hecho observable

- [ ] cada aprobación lógica emite un único hecho observable.

### CAD-133-03 — Envelope y payload exponen expected/counted/difference suficientes

- [ ] payload expone expected/counted/difference y revisiones suficientes.

### CAD-133-04 — El evento omite evidencia sensible y no se reemite por ajustes tardíos

- [ ] evidencia sensible queda fuera y late adjustments no reemiten el evento.

### CAD-133-05 — Retries, rollback y reorder convergen con outbox y dedupe

- [ ] retry, rollback y reorder convergen con dedupe.

### CAD-133-06 — La aprobación exige evidencia de rechazo previo, ajustes tardíos y evolución

- [ ] fixtures cubren rechazo previo, repetición, ajustes tardíos y cross-tenant.
