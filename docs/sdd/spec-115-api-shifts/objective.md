# Objetivo — SPEC-115

Definir la API autoritativa de WorkShifts para crear, publicar, iniciar, completar y cancelar
turnos versionados con validación laboral explícita.

## Criterios de aceptación

### CAD-115-01 — La API de WorkShifts define endpoints y ciclo de vida con alcance temporal y sucursal claros

endpoints create/list/detail/edit y comandos de ciclo de vida quedan definidos con alcance
temporal y de sucursal claros.

### CAD-115-02 — Create y commands usan idempotencia; edición valida revisión esperada

create y commands usan idempotencia; edición y transiciones validan `If-Match` o revisión
esperada.

### CAD-115-03 — Intervalos UTC, timezone IANA y LaborPolicyVersion tienen contrato estable

intervals UTC + timezone IANA y LaborPolicyVersion se validan con contrato estable.

### CAD-115-04 — Publish revalida cobertura, conflictos y elegibilidad sin degradaciones silenciosas

`publish` revalida cobertura, conflictos y elegibilidad de assignments sin aceptar
degradaciones silenciosas.

### CAD-115-05 — Complete no cierra asistencia real ni TimeEntry implícitamente

`complete` no cierra asistencia real ni TimeEntry implícitamente; sólo reporta y deriva al
workflow correcto.

### CAD-115-06 — La aprobación exige evidencia de DST, overlaps, publish y RBAC

La aprobación exige fixtures de DST, overlaps, concurrencia, publish, cancelación, RBAC y
aislamiento.
