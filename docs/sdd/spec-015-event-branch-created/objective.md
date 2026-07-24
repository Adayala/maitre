# Objetivo — SPEC-015

## Propósito

Publicar la creación confirmada de una Branch para inicializar proyecciones sin declarar completo
el onboarding ni filtrar dirección, contacto o autoridad de acceso.

## Criterios de aceptación

### CAD-015-01 — El hecho se identifica como `organization.branch.created.v1` con `branchId` estable

El hecho se identifica como `organization.branch.created.v1`, agregado Branch y `branchId` estable.

### CAD-015-02 — Branch y outbox son atómicos y una falla de consumidor no revierte la creación

Branch y outbox son atómicos; una falla de consumidor no revierte la creación y retry conserva la
identidad lógica.

### CAD-015-03 — tenantId, brandId y fiscalEntityId pertenecen al mismo Tenant y timezone queda fijada

TenantId, brandId y fiscalEntityId pertenecen al mismo Tenant y timezone es una zona IANA válida
fijada al ocurrir el hecho.

### CAD-015-04 — El payload excluye dirección, teléfono y datos sensibles

Payload excluye dirección, teléfono y datos sensibles, y no presenta salons, tables, subscription u
onboarding como completados.

### CAD-015-05 — Consumidores deduplican, manejan orden parcial y no usan el payload como prueba de permisos

Consumidores deduplican por eventId, manejan orden parcial y no usan el payload como prueba de
permisos.

### CAD-015-06 — Schema, outbox, retry, DLQ y compatibilidad tienen resultados verificables

Schema, outbox, retry/DLQ, aislamiento, payload mínimo y compatibilidad poseen resultados
verificables; breaking changes crean nueva versión.
