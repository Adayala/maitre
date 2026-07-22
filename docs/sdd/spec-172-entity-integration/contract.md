# Contrato de entidad — SPEC-172 Integration

Integration representa una instalación tenant-scoped de un conector con provider, versión,
capacidades, configuración no secreta, referencias a credenciales y estado
DRAFT/ACTIVE/DEGRADED/DISABLED. Configuración se versiona y valida contra schema; desactivar no
borra historial. Tests cubren unicidad, upgrade, capacidad faltante, health stale, rotación,
auditoría y aislamiento entre tenants.
