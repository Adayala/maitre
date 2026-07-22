# Contrato API — SPEC-179 Sync

Solicitar sincronización completa o incremental, consultar ejecución y reintentar fallos
recuperables. Create es idempotente y evita ejecuciones incompatibles concurrentes; cursores se
actualizan sólo tras persistencia confirmada y el resultado diferencia parcial de completo.
Tests cubren cancelación, timeout, cursor corrupto, backfill, rate limit, reintento, RBAC,
auditoría y aislamiento entre tenants.
