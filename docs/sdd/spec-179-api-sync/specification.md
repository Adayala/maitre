# Especificación — SPEC-179 Sync API

Start full/incremental, get run y retry recoverable partition. Start es idempotente, adquiere lease y
rechaza runs incompatibles. Full/backfill no reemplaza cursor incremental sin policy explícita.

Writes aplican OwnershipMatrix y external ID mapping. Cursor avanza conforme SPEC-175; PARTIAL
declara partitions/counts/errors y no se etiqueta success. Cancel detiene próximos batches y libera
lease seguro. Retry reutiliza run correlation y no duplica side effects.

`POST /sync-runs` inicia ejecuciones; `GET /sync-runs/{syncRunId}` devuelve estado detallado; `POST
/sync-runs/{syncRunId}:cancel` solicita cancelación segura; `POST /sync-runs/{syncRunId}:retry`
reintenta particiones recuperables. Errores distinguen lease conflict, policy incompatibility,
retry no recuperable y lifecycle inválido.

La API es operacional, no autoritativa sobre el estado de negocio remoto/local por sí sola. Sus
acciones se subordinan a ownership matrix, ID mapping y checkpoint semantics. `retry` debe conservar
correlation suficiente para observabilidad sin reemitir side effects ya confirmados.
