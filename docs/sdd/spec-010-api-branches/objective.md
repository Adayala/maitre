# Objetivo — SPEC-010

## Propósito

Administrar sucursales físicas dentro del tenant, vinculándolas explícitamente con Brand y
FiscalEntity sin convertir sucursal en una frontera de tenancy independiente.

## Criterios de aceptación

### CAD-010-01 — Create deriva tenant del contexto y rechaza Brand o FiscalEntity inválidas

Create deriva tenant del contexto y rechaza Brand/FiscalEntity inexistentes, de otro tenant o
incompatibles.

### CAD-010-02 — Nombre, timezone, dirección y contacto cumplen validaciones canónicas

Nombre, timezone IANA, dirección estructurada y contacto cumplen validaciones canónicas; cuota
agotada produce conflicto sin creación parcial.

### CAD-010-03 — Reintentar Create con la misma key devuelve la misma sucursal

Reintentar Create con misma key/payload devuelve la misma sucursal; distinto payload devuelve conflicto.

### CAD-010-04 — List y get usan alcance tenant/sucursal, cursor opaco y orden estable

List/get usan alcance tenant/sucursal, cursor opaco y orden estable, sin expansiones que dupliquen
autoridad de Salon/Table.

### CAD-010-05 — PATCH exige `If-Match` y no reasigna silenciosamente tenant, brand o fiscal entity

PATCH exige `If-Match`, no reasigna tenant/brand/fiscal entity silenciosamente y rechaza inactivación
incompatible con operación activa.

### CAD-010-06 — Problem Details, permisos, auditoría y OpenAPI cubren cuota, idempotencia y aislamiento

Problem Details, permisos, auditoría sanitizada y OpenAPI cubren cuota, idempotencia, concurrencia y
aislamiento.
