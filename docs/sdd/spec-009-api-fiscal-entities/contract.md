# Contrato API — SPEC-009

API privada para crear/listar/obtener/PATCH FiscalEntities. TaxId y datos legales se
minimizan/redactan por permiso; certificados se gestionan mediante referencias y nunca se
devuelven secretos. Create admite reintento idempotente, PATCH es concurrente con `If-Match`
y cambios sensibles exigen actor/auditoría, `reason` y step-up reciente. La lectura con
permiso administrativo simple puede devolverse en forma redactada.

No existe hard delete ni mutación retroactiva de comprobantes. `404` evita enumeración,
`409` cubre taxId duplicado y conflictos de concurrencia adoptados por la API actual,
`412` es compatible si el handler decide materializar precondition failed en vez de conflict,
y `422` queda reservado para validación/vigencia/relaciones con autoridad fiscal externa.
Tests cubren CUIT, redacción, RBAC, uso por sucursal, aislamiento cross-tenant,
idempotencia de create, outbox/audit sanitizados y concurrencia de PATCH.
