# Contrato API — SPEC-040

Rutas `/v1/menus`: crear draft, listar, obtener revisión, PATCH draft, publicar y archivar.
Publicación es command idempotente con `If-Match`; valida categorías/productos/scopes y
devuelve nueva revisión/ETag. No se edita una revisión publicada.

Listas usan cursor, status/branch filters y orden estable. `404` oculta cross-tenant, `409`
cubre publicación/idempotencia y `412` concurrencia. Permisos según SPEC-043; mutaciones y
publicaciones se auditan. Tests verifican snapshot, doble publish, scopes y OpenAPI.
