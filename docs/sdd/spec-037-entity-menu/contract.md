# Contrato — SPEC-037

`Menu` es un agregado versionado de oferta comercial para uno o más alcances por sucursal. Campos:
id, tenantId, name, status (`DRAFT | PUBLISHED | ARCHIVED`), currency, alcances, revisión y
auditoría. DRAFT es editable; PUBLISHED es snapshot inmutable para consumidores y cambios
crean nueva revisión; ARCHIVED no se ofrece pero conserva historia.

Categorías/productos referenciados pertenecen al tenant. Publicar exige contenido válido,
precios/moneda coherentes y al menos un alcance. Dos revisiones activas pueden coexistir sólo
con vigencias/alcances no ambiguos. Tests cubren ciclo de vida, snapshot, publicación concurrente,
aislamiento entre tenants y archivo con órdenes históricas.
