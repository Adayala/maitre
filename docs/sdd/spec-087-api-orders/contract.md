# Contrato API — SPEC-087 Orders

Crear/listar/obtener órdenes y ejecutar submit/cancel mediante comandos explícitos. Toda
orden pertenece a tenant, branch y visit; el servidor calcula importes desde snapshots
del catálogo y rechaza precios enviados por el cliente. Idempotency-Key protege create y
submit, e If-Match evita escrituras perdidas. Tests cubren reintentos, concurrencia,
productos no disponibles, redondeo, autorización, aislamiento entre tenants y auditoría.
