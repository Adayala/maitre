# Contrato — SPEC-051 TableStatus

TableStatus es una proyección derivada, no entidad editable. Valores:
`BLOCKED | OCCUPIED | PAYING | CLEANING | RESERVED | AVAILABLE`, con precedencia en ese
orden salvo regla operativa aprobada. Incluye tableId, status, reasonCode, related resource,
revision y `asOf`. Señales duplicadas/desordenadas convergen por versiones y refetch. Toda
mutación revalida fuentes autoritativas. Tests cubren precedencia, stale projection,
reservas futuras, limpieza/bloqueo y ausencia de writes directos.
