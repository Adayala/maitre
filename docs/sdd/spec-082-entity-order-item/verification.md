# Verificación — SPEC-082

## Criterios

### CAD-082-01 — El snapshot de OrderItem queda completo e inmutable al submit

- [ ] snapshots congelados conservan producto/modifier/impuestos/restricciones.

### CAD-082-02 — El lifecycle operativo de OrderItem es inequívoco

- [ ] transiciones inválidas, regresiones y terminalidad fallan cerrado.

### CAD-082-03 — El fulfillment parcial conserva cantidades exactas

- [ ] splits y entregas parciales conservan quantity exacta sin duplicación.

### CAD-082-04 — Cancelaciones y cambios posteriores producen ajustes auditados

- [ ] cancelaciones y ajustes registran impacto comercial/operativo completo.

### CAD-082-05 — Notas e instrucciones quedan tipadas y sanitizadas

- [ ] notas/instrucciones quedan tipadas, sanitizadas y sin PII insegura.

### CAD-082-06 — La aprobación exige evidencia de split, retry y concurrencia

- [ ] retries, stale revision, carreras y cross-scope poseen evidencia determinista.
