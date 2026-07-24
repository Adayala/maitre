# Objetivo — SPEC-042

## Propósito

Administrar definiciones editoriales de Product tenant-scoped y sus referencias seguras a media,
sin mezclar Category/MenuItem, precio publicado ni availability operativa.

## Criterios de aceptación

### CAD-042-01 — El CRUD deriva Tenant del contexto y no acepta campos ajenos al dominio Product

Create/list/get/PATCH derivan Tenant del contexto y no aceptan category, price, currency, position o
operational status como campos de Product.

### CAD-042-02 — Create usa Idempotency-Key y valida refs contra catálogos y scopes autorizados

Create usa Idempotency-Key y valida tax/allergen/dietary/modifier/media refs contra catálogos/scopes
autorizados.

### CAD-042-03 — PATCH exige `If-Match` y editar Product no cambia revisiones publicadas ni historia

PATCH exige `If-Match`; editar Product no cambia MenuRevision publicada ni OrderItem histórico.

### CAD-042-04 — Archive conserva identidad y snapshots e impide nuevas colocaciones

Archive conserva identidad/snapshots e impide nuevas colocaciones; no existe hard DELETE.

### CAD-042-05 — Media se vincula por asset refs validadas y no acepta URLs arbitrarias

Media se vincula por asset refs ya validadas; esta API no acepta URLs arbitrarias ni define
upload/CDN multipart.

### CAD-042-06 — Estados HTTP, RBAC, auditoría, redacción y OpenAPI poseen evidencia de refs y concurrency

404/409/412/422, RBAC, auditoría, redacción y OpenAPI poseen evidencia de catalog refs, concurrency e
isolation.
