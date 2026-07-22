# Especificación — SPEC-179 Sync API

Start full/incremental, get run y retry recoverable partition. Start es idempotente, adquiere lease y
rechaza runs incompatibles. Full/backfill no reemplaza cursor incremental sin policy explícita.

Writes aplican OwnershipMatrix y external ID mapping. Cursor avanza conforme SPEC-175; PARTIAL
declara partitions/counts/errors y no se etiqueta success. Cancel detiene próximos batches y libera
lease seguro. Retry reutiliza run correlation y no duplica side effects.
