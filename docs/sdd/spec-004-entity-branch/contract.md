# Contrato — SPEC-004 Branch

Branch es una sucursal operativa de Brand dentro de un tenant y referencia FiscalEntity.
Campos: ids inmutables, name, structured address, timezone IANA, contacts, status
`ACTIVE | INACTIVE`, version y auditoría. Business dates siempre derivan de timezone.

Brand/FiscalEntity pertenecen al mismo tenant. Inactivar bloquea nuevas operaciones y exige
workflow para visitas/servicios pendientes; no borra historia. Cambiar brand/fiscal entity
con actividad o comprobantes requiere migración explícita. Tests cubren coherencia,
timezone/DST, cuota, lifecycle, PII y aislamiento.
