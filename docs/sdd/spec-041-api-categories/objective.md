# Objetivo — SPEC-041

## Propósito

Administrar Categories dentro de una MenuRevision DRAFT, incluyendo reorder atómico, sin mutar
revisiones publicadas ni asumir ownership de Products.

## Criterios de aceptación

### CAD-041-01 — Create y list usan `menuRevisionId` DRAFT coherente con Tenant

Create/list usan `menuRevisionId` DRAFT coherente con Tenant y ocultan scopes cross-tenant.

### CAD-041-02 — Nombre normalizado único y sortOrder estable producen conflictos deterministas

Nombre normalizado único y sortOrder estable producen conflictos deterministas.

### CAD-041-03 — PATCH exige `If-Match` de revisión/categoría y sólo modifica DRAFT

PATCH exige `If-Match` de revisión/categoría y sólo modifica DRAFT.

### CAD-041-04 — Reorder recibe conjunto completo esperado y se aplica atómicamente

Reorder recibe conjunto completo esperado, rechaza IDs faltantes/duplicados/cross-revision y se
aplica atómicamente.

### CAD-041-05 — Ocultar o remover de DRAFT no borra Category publicada ni OrderItems

Ocultar/remover de DRAFT no borra Category publicada ni OrderItems; no existe DELETE físico.

### CAD-041-06 — RBAC, auditoría, estados HTTP y OpenAPI poseen evidencia de concurrencia y ordering

RBAC, auditoría, 404/409/412/422 y OpenAPI poseen evidencia de concurrencia, ordering e isolation.
