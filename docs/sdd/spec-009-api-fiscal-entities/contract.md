# Contrato API — SPEC-009

API privada para crear/listar/obtener/PATCH FiscalEntities. TaxId y datos legales se
minimizan/redactan por permiso; certificados se gestionan mediante referencias y nunca se
devuelven secretos. Create es idempotente, PATCH concurrente y cambios sensibles exigen
motivo/auditoría.

No hard delete ni mutación retroactiva de invoices. 409 cubre taxId duplicado, 412 versión,
422 validación/vigencia/relaciones y 404 evita enumeración. Tests cubren CUIT, redacción,
RBAC, branch usage, cross-tenant y schema OpenAPI.
