# Contrato API — SPEC-042

API para crear/listar/obtener/PATCH Product tenant-scoped. Body valida tax category, declarations,
modifier sets y media refs; no acepta tenant, Category/MenuItem, price/currency/position ni estado
operativo derivado.

Idempotency-Key protege create; If-Match protege PATCH. Revisiones publicadas contienen snapshots y
no cambian al editar Product. Archivar impide nuevas colocaciones pero conserva historia. Assets se
gestionan por contrato propio y aquí sólo se aceptan refs autorizadas. Tests cubren payload limits,
refs, cross-tenant, concurrencia, auditoría y OpenAPI.
