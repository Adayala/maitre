# Objetivo — SPEC-011

## Propósito

Administrar salones como agrupaciones configurables de mesas dentro de una sucursal, sin convertir su
capacidad administrativa en autoridad de ocupación o disponibilidad operativa.

## Criterios de aceptación

### CAD-011-01 — Create y list bajo Branch resuelven tenant y sucursal desde path y contexto

Create/list bajo Branch resuelven tenant/sucursal desde path y contexto; un alcance cross-tenant no crea,
lista ni revela salones.

### CAD-011-02 — El nombre normalizado es único case-insensitive dentro de Branch

El nombre normalizado es único case-insensitive dentro de Branch y los conflictos son deterministas.

### CAD-011-03 — `maxCapacity` es administrativo y no deriva de una proyección eventual de mesas

`maxCapacity` es entero positivo administrativo y no se recalcula desde una proyección eventual de
mesas.

### CAD-011-04 — Reducir capacidad o inactivar se rechaza si contradice configuración u operación activa

Reducir capacidad o inactivar se rechaza cuando contradice configuración u operación activa; no existe
eliminación física.

### CAD-011-05 — PATCH requiere `If-Match` y list no expande Table ni presenta conteos autoritativos

PATCH requiere `If-Match`; list tiene paginación/orden estable y no expande Table ni presenta conteos
derivados como autoridad.

### CAD-011-06 — Problem Details, permisos, auditoría y OpenAPI cubren unicidad y ciclo de vida

Problem Details, permisos, auditoría y OpenAPI cubren unicidad, capacidad, concurrencia, ciclo de vida y
aislamiento.
