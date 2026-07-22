# Contrato RBAC — SPEC-109 Kitchen

Separar permisos para ver colas, reclamar producción, cambiar estados, administrar estaciones y
gestionar alertas. La autorización combina roles canónicos COOK/MAITRE/MANAGER con assignments de
expediter, tenant, sucursal, estación y turno activo; no crea roles locales `kitchen operator` o
`expediter`. Toda excepción requiere motivo auditable. Tests cubren matriz de permisos,
escalamiento, reasignación y revocación inmediata.
