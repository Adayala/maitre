# Verificación — SPEC-081

## Criterios

### CAD-081-01 — El scope de Order queda fijado al crear y nunca muta

- [ ] scope inmutable y referencias cross-tenant/brand/branch/visit fallan cerrado.

### CAD-081-02 — Los estados autoritativos y derivados tienen precedencia reproducible

- [ ] derivación de estados y precedencia producen resultados únicos y reproducibles.

### CAD-081-03 — Submit revalida catálogo y congela snapshot con idempotencia

- [ ] submit idempotente congela snapshot y rechaza catálogo/restricciones cambiadas.

### CAD-081-04 — Los cambios post-submit se modelan como ajustes auditados

- [ ] ajustes posteriores conservan historial sin sobrescribir revisiones previas.

### CAD-081-05 — Order conserva su frontera comercial sin asumir autoridad fiscal

- [ ] totales, currency y frontera con Check/Fiscal quedan consistentes y no fiscales.

### CAD-081-06 — La aprobación exige evidencia de submit, catálogo y concurrencia

- [ ] fixtures cubren retries, carreras, cancelación y aislamiento de scope.
