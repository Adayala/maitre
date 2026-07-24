# Verificación — SPEC-162

## Criterios

### CAD-162-01 — El submit público usa capability opaca, revocable y no revela IDs internos

- [ ] la capability pública es opaca, revocable, expirable y no revela IDs internos.

### CAD-162-02 — Submit público exige idempotencia, anti-bot y sanitización

- [ ] submit aplica idempotencia, anti-bot, límites y sanitización.

### CAD-162-03 — La API interna usa `If-Match`, permiso, reason y audit trail

- [ ] comandos internos usan `If-Match`, permiso, reason y auditoría.

### CAD-162-04 — Contenido y PII se redactan por default según permiso y propósito

- [ ] PII y contenido sensible se redactan por default.

### CAD-162-05 — Delete/purge respeta retención y no afirma borrado remoto

- [ ] delete/purge respeta retención y no afirma borrado remoto.

### CAD-162-06 — La aprobación exige evidencia de capability, anti-bot y retención

- [ ] fixtures cubren capability, concurrencia, redacción y retención.
