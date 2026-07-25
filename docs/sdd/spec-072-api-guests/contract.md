# Contrato API — SPEC-072 Guests

API tenant-scoped para crear/obtener/PATCH/lookup/anonymize Guest. Búsqueda por contacto requiere
`guest:pii_read`, es exacta por `email` o `phone`, y no enumera coincidencias cross-tenant.
`PATCH` no usa `If-Match` todavía. No hay consent ledger, merge/unmerge, export workflow ni
subrecurso de contact points en este I0. `anonymize` es síncrono y conserva el registro lógico
sin borrar referencias históricas. Tests cubren create/anonymize, lookup exacto y autorización.
