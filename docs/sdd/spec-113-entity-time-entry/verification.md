# Verificación — SPEC-113

## Criterios

### CAD-113-01 — TimeEntry define scope, Employment authority y unicidad de OPEN sin ambigüedad

- [ ] unicidad de OPEN por Employment/tenant se valida correctamente.

### CAD-113-02 — Timestamps, timezone, source y skew quedan especificados para auditoría

- [ ] capturedAt/receivedAt/timezone/source/skew quedan auditables y consistentes.

### CAD-113-03 — Lifecycle y anomalías permanecen separados y son inequívocos

- [ ] lifecycle y anomalías/review permanecen separados.

### CAD-113-04 — TimeAdjustment conserva fuente original y trazabilidad before/after

- [ ] TimeAdjustment conserva before/after sin ocultar el original.

### CAD-113-05 — Trabajo sin shift, DST y concurrencia siguen policy explícita

- [ ] DST, trabajo sin shift y concurrencia siguen policy explícita.

### CAD-113-06 — La aprobación exige evidencia de doble marcación, skew y ajustes

- [ ] fixtures cubren doble marcación, skew, ajustes y cross-tenant.
