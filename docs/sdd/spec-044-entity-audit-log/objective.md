# Objetivo — SPEC-044

## Propósito

Conservar evidencia append-only, íntegra y minimizada de acciones sensibles y sus outcomes para
investigación, accountability y obligaciones de retención.

## Criterios de aceptación

### CAD-044-01 — Cada acción sensible registra actor efectivo, tenant, action/resource, outcome y correlation

Cada acción sensible registra actor efectivo, tenant, action/resource, outcome, reason y
correlation/causation sin aceptar identidad declarada por el cliente.

### CAD-044-02 — Los records son append-only, secuenciados por partición y enlazan hash previo

Records son append-only, secuenciados por partición y enlazan hash previo para detectar alteración,
pérdida o reordenamiento.

### CAD-044-03 — Before/after son diffs sanitizados por schema

Before/after son diffs sanitizados por schema; tokens, passwords, secrets, PII completa, IP y
user-agent crudos quedan excluidos.

### CAD-044-04 — Falla de auditoría bloquea cambios sensibles y la degradación no crítica es explícita

Falla de auditoría bloquea cambios financieros, fiscales, permisos, secretos y soporte cross-tenant;
degradación de telemetría no crítica es explícita/reconciliable.

### CAD-044-05 — Retención, legal hold, export y privacy disposition siguen policy versionada

Retención, legal hold, export y privacy disposition siguen policy versionada; no existe cleanup
default arbitrario.

### CAD-044-06 — Inmutabilidad, redacción, integridad, clocks, partition ordering, failure mode e isolation poseen evidencia

Inmutabilidad, redacción, integridad, clocks, partition ordering, failure mode e isolation poseen
evidencia contractual.
