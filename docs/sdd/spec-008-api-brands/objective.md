# Objetivo — SPEC-008

## Propósito

Administrar marcas comerciales dentro del Tenant sin confundir Brand con cliente/tenancy ni con
Branch, preservando aislamiento, lifecycle y concurrencia.

## Criterios de aceptación

### CAD-008-01 — Create, list, get y PATCH derivan `tenantId` del contexto autenticado

Create/list/get/PATCH derivan `tenantId` del contexto autenticado y nunca aceptan autoridad tenant
desde body/query.

### CAD-008-02 — Create es idempotente y no duplica Brand ni evento lógico

Create es idempotente; la misma key con distinto payload falla y no duplica Brand ni evento lógico.

### CAD-008-03 — Slug y nombre normalizados respetan unicidad por tenant

Slug/nombre normalizados respetan unicidad definida por tenant y producen conflictos deterministas.

### CAD-008-04 — List usa cursor opaco, filtros permitidos y orden estable

List usa cursor opaco, filtros permitidos y orden estable sin revelar marcas cross-tenant.

### CAD-008-05 — PATCH exige `If-Match` e inactivación preserva historia

PATCH exige `If-Match`; inactivación preserva historia y se rechaza si rompe sucursales o publicaciones
activas.

### CAD-008-06 — OpenAPI, Problem Details, permisos y auditoría cubren normalización y aislamiento

OpenAPI, Problem Details, permisos y auditoría cubren normalización, paginación, concurrencia y
aislamiento.
