# Verificación — SPEC-075

## Criterios

### CAD-075-01 — Los comandos comunicacionales se separan de la lectura de delivery

- [ ] OpenAPI contiene tres comandos y una lectura, sin destination/propósito libre.

### CAD-075-02 — Cada intento congela snapshot comunicacional e identidad idempotente

- [ ] snapshots de policy/template/consent permanecen reproducibles.

### CAD-075-03 — Intent y outbox se confirman sin llamar al provider ni mutar Reservation

- [ ] duplicate crea una intención lógica y rollback deja cero outbox.

### CAD-075-04 — Opt-out y gobernanza por propósito/channel no admiten bypass

- [ ] matriz opt-out/propósito/channel/template/rate no admite bypass.

### CAD-075-05 — Reintentos y callbacks convergen en proyección separada y segura

- [ ] provider caído/retry/callback convergen sin cambiar Reservation ni filtrar secretos.

### CAD-075-06 — La aprobación exige evidencia de consent, DLQ y aislamiento

- [ ] permissions, capability, DLQ, auditoría, redacción y aislamiento poseen evidencia.
