# Objetivo — SPEC-162

Definir la API pública e interna de feedback con submission seguro, gestión operativa auditable y
privacy-by-default.

## Criterios de aceptación

### CAD-162-01 — El submit público usa capability opaca, revocable y no revela IDs internos

el submit público usa una capability `FEEDBACK_SUBMIT` opaca, hasheada, expirable,
revocable, rate-limited y sin revelar Visit/Order u otros IDs internos.

### CAD-162-02 — Submit público exige idempotencia, anti-bot y sanitización

submit público exige idempotencia, anti-bot, límites de tamaño y sanitización de
contenido/attachments.

### CAD-162-03 — La API interna usa `If-Match`, permiso, reason y audit trail

la API interna expone list/detail y comandos `triage`, `assign`, `resolve`, `reopen`,
`redact` bajo `If-Match`, permiso, reason y audit trail.

### CAD-162-04 — Contenido y PII se redactan por default según permiso y propósito

contenido y PII se redactan por default según permiso, propósito y visibilidad.

### CAD-162-05 — Delete/purge respeta retención y no afirma borrado remoto

delete o purge ejecuta matriz de retención y nunca afirma borrado remoto cuando la fuente
original era externa.

### CAD-162-06 — La aprobación exige evidencia de capability, anti-bot y retención

La aprobación exige fixtures de capability pública, idempotencia, anti-bot, concurrencia
operativa, redaction y retención.
