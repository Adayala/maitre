# Contrato API — SPEC-105 Kitchen Alerts

Listar alertas operativas y ejecutar acknowledge/resolve/escalate con actor, motivo y
timestamp. La creación automática usa una clave de deduplicación por regla y ventana; las
alertas resueltas son inmutables salvo reapertura autorizada. La API permite filtros por
severidad, estación y estado. Tests cubren tormentas de eventos, expiración, escalamiento,
concurrencia, auditoría, RBAC y aislamiento entre tenants.
