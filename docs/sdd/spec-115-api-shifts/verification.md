# Verificación — SPEC-115

## Criterios

### CAD-115-01 — La API de WorkShifts define endpoints y ciclo de vida con alcance temporal y sucursal claros

- [ ] endpoints y comandos de ciclo de vida respetan alcance temporal/sucursal.

### CAD-115-02 — Create y commands usan idempotencia; edición valida revisión esperada

- [ ] idempotencia y `If-Match` cubren retries y lost updates.

### CAD-115-03 — Intervalos UTC, timezone IANA y LaborPolicyVersion tienen contrato estable

- [ ] UTC, timezone IANA y labor policy se validan consistentemente.

### CAD-115-04 — Publish revalida cobertura, conflictos y elegibilidad sin degradaciones silenciosas

- [ ] `publish` revalida cobertura, conflictos y elegibilidad sin degradación.

### CAD-115-05 — Complete no cierra asistencia real ni TimeEntry implícitamente

- [ ] `complete` no cierra TimeEntry implícitamente y deriva workflow explícito.

### CAD-115-06 — La aprobación exige evidencia de DST, overlaps, publish y RBAC

- [ ] fixtures cubren DST, overlaps, concurrencia y cruces de alcance.
