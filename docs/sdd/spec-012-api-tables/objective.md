# Objetivo — SPEC-012

## Propósito

Administrar configuración de mesas físicas dentro de Salon separándola estrictamente del estado
operativo derivado de ocupación, reserva o servicio.

## Criterios de aceptación

### CAD-012-01 — Create y list bajo Salon verifican coherencia tenant, sucursal y salón

Create/list bajo Salon verifican coherencia tenant/sucursal/salón y ocultan todo recurso cross-tenant
como inexistente.

### CAD-012-02 — Número normalizado es único por Salon y la capacidad respeta límites

Número normalizado es único por Salon; capacidad permanece entre 1 y 20 y la suma respeta el límite
administrativo aprobado.

### CAD-012-03 — Los cuerpos rechazan estado operativo derivado y cualquier intento de ocupar o reservar

Los cuerpos rechazan estado operativo derivado y cualquier intento de ocupar, bloquear, limpiar o reservar
mediante este CRUD.

### CAD-012-04 — PATCH exige `If-Match` y no mueve una mesa entre salones

PATCH exige `If-Match`, no mueve una mesa entre salones y rechaza reducción o inactivación
incompatible con asignación/ocupación activa.

### CAD-012-05 — No existe hard delete para mesas referenciadas

No existe hard delete para mesas referenciadas; inactivación conserva IDs e historia.

### CAD-012-06 — Problem Details, permisos, auditoría y OpenAPI cubren unicidad y rechazo de estado operativo

Problem Details, permisos, auditoría y OpenAPI cubren unicidad, límites, concurrencia, rechazo de
estado operativo y aislamiento.
