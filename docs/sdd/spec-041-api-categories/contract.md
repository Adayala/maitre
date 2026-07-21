# Contrato API — SPEC-041

Rutas anidadas `/v1/menus/{menuId}/categories` para crear/listar y
`/v1/categories/{id}` para PATCH/reorder/archive. Sólo drafts son mutables y toda operación
usa revisión del Menu/`If-Match`.

Reorder recibe secuencia completa o comando estable y es atómico; IDs faltantes, repetidos
o cross-menu fallan. No existe hard delete publicado. Problem Details, tenant isolation,
RBAC SPEC-043, auditoría y tests de concurrencia/reorder son obligatorios.
