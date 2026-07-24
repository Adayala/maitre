# Contrato API — SPEC-040

Rutas `/v1/menus`: crear draft, listar, obtener revisión, PATCH draft, publicar y archivar.
Publicación es un comando idempotente con `If-Match`; valida categorías/productos/alcances y
devuelve nueva revisión/ETag. No se edita una revisión publicada.

Listas usan cursor, filtros `status/branch` y orden estable. `404` oculta otro tenant, `409`
cubre publicación/idempotencia y `412` concurrencia. Permisos según SPEC-043; mutaciones y
publicaciones se auditan. Tests verifican snapshot, doble publish, alcances y OpenAPI.
