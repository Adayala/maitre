# Objetivo — SPEC-112

Definir ShiftAssignment como vínculo temporal entre un Shift, un miembro/actor operativo y un alcance de trabajo aprobado, con reglas claras de unicidad, superposición y corrección.

## Criterios de aceptación

### CAD-112-01 — ShiftAssignment pertenece a un Shift válido y a un actor del mismo tenant/sucursal

Cada assignment referencia un Shift coherente y un actor autorizado dentro del mismo alcance. Las referencias cross-tenant o cross-sucursal se rechazan.

### CAD-112-02 — El alcance operativo del assignment es explícito y no reemplaza RBAC global

El assignment define un alcance operacional como station, sección o función temporal aprobada, pero no concede permisos globales fuera del RBAC y Membership existentes.

### CAD-112-03 — La unicidad y superposición de assignments siguen una policy declarada

El sistema define si un actor puede tener assignments simultáneos incompatibles y cómo resolverlos. La ausencia de policy explícita falla cerrado.

### CAD-112-04 — Activar, mover o cerrar assignments conserva historia y no reescribe ventanas cerradas

Los cambios en assignments crean o cierran intervalos según policy, sin borrar evidencia histórica ni mutar retrospectivamente una asignación cerrada.

### CAD-112-05 — Los comandos sobre assignments usan concurrencia explícita, idempotencia y auditoría

Crear, reasignar o cerrar un assignment debe soportar retries y conflictos de revisión de forma determinista, dejando trazabilidad completa.

### CAD-112-06 — La aprobación exige fixtures de superposición, retries, close de Shift y aislamiento operativo

La spec se aprueba sólo con evidencia de overlaps, retries, reassign concurrente, cierre de Shift y aislamiento por tenant/sucursal/alcance.
