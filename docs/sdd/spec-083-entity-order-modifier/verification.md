# Verificación — SPEC-083

## Criterios

### CAD-083-01 — La identidad y pricing del modifier quedan congelados al submit

- [ ] snapshot congelado conserva identidad, labels, quantity y pricing exactos.

### CAD-083-02 — Las validaciones de modifier son inequívocas y cerradas

- [ ] pertenencia, vigencia, min/max, exclusividad y duplicados fallan cerrado.

### CAD-083-03 — Instrucciones y notas libres usan tipos controlados

- [ ] instrucciones tipadas y texto libre quedan sanitizados y acotados.

### CAD-083-04 — Los cambios post-submit sólo viven como ajustes auditados

- [ ] cambios posteriores generan ajustes sin sobrescribir historial.

### CAD-083-05 — Modifiers no reemplazan controles de seguridad ni override

- [ ] alergia/seguridad y overrides no se reemplazan con texto libre.

### CAD-083-06 — La aprobación exige evidencia de combinaciones, pricing y stale catalog

- [ ] fixtures cubren combinaciones, replay, stale catalog y cross-scope.
