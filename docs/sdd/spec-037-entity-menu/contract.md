# Contrato — SPEC-037 Menu

Menu es un agregado versionado de oferta comercial para uno o más branch scopes. Campos:
id, tenantId, name, status (`DRAFT | PUBLISHED | ARCHIVED`), currency, scopes, revision y
auditoría. DRAFT es editable; PUBLISHED es snapshot inmutable para consumidores y cambios
crean nueva revisión; ARCHIVED no se ofrece pero conserva historia.

Categorías/productos referenciados pertenecen al tenant. Publicar exige contenido válido,
precios/moneda coherentes y al menos un scope. Dos revisiones activas pueden coexistir sólo
con vigencias/scope no ambiguos. Tests cubren lifecycle, snapshot, publicación concurrente,
tenant isolation y archivo con órdenes históricas.
