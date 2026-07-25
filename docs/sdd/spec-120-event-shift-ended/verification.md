# Verificación — SPEC-120

Estado actual: assessment inicial de especificación. El payload mínimo I0 queda alineado con la
forma actual del evento en código; forced-close/agregados/privacy-threshold quedan diferidos u
opcionales.

## Criterios

### CAD-120-01 — ShiftEnded fija nombre, timing y separación frente al clock-out individual

- [ ] cierre administrativo y clock-out individual quedan separados.

### CAD-120-02 — Cada transición lógica a `COMPLETED` emite un único hecho

- [ ] cada transición lógica a `COMPLETED` emite un único hecho observable.

### CAD-120-03 — Envelope y payload exponen outcome, policy y agregados autorizados suficientes

- [ ] payload expone outcome, completedAt y policy/revisión suficientes.

### CAD-120-04 — Open entries bloquean cierre salvo override auditado y sin exponer fichadas

- [ ] open entries, override y privacidad se respetan normativamente.

### CAD-120-05 — Retries, rollback y reorder convergen con outbox y dedupe

- [ ] retry, rollback y reorder convergen con outbox/dedupe.

### CAD-120-06 — La aprobación exige evidencia de open entries, forced close y privacidad

- [ ] fixtures cubren forced close, duplicados, privacidad y cross-tenant.
