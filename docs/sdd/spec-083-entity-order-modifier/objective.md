# Objetivo — SPEC-083

Definir OrderModifier como snapshot tipado de opciones aplicadas a un OrderItem con pricing y
restricciones verificables.

## Criterios de aceptación

### CAD-083-01 — La identidad y pricing del modifier quedan congelados al submit

identity de group/option, labels, quantity, pricing y tax treatment quedan congelados al
submit.

### CAD-083-02 — Las validaciones de modifier son inequívocas y cerradas

validaciones de pertenencia, vigencia, min/max, exclusividad y duplicados son inequívocas.

### CAD-083-03 — Instrucciones y notas libres usan tipos controlados

kitchen instructions y notas libres se separan en tipos controlados y sanitizados.

### CAD-083-04 — Los cambios post-submit sólo viven como ajustes auditados

cambios post-submit sólo ocurren mediante ajuste auditado, nunca mutando el snapshot
original.

### CAD-083-05 — Modifiers no reemplazan controles de seguridad ni override

modifiers no sustituyen controles de alergia, seguridad ni permisos de override.

### CAD-083-06 — La aprobación exige evidencia de combinaciones, pricing y stale catalog

La aprobación exige fixtures de combinaciones válidas/inválidas, pricing, replay, stale
catalog y aislamiento.
