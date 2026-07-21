# Contrato — SPEC-003 FiscalEntity

FiscalEntity representa al sujeto fiscal que emite comprobantes para una o más Branches.
Campos: tenantId, country, taxId/CUIT normalizado, legalName, tax condition, fiscal address,
status, validity, certificate references opacas, version y auditoría.

CUIT se valida formalmente pero la vigencia oficial requiere consulta/operación autorizada.
Certificados y claves no viven en la entidad ni se exponen. Cambios de identidad fiscal no
reescriben comprobantes emitidos; estos capturan snapshot. Unicidad se evalúa según tenant y
regla legal. Tests cubren CUIT, vigencias, redacción, branch relation y cross-tenant.
