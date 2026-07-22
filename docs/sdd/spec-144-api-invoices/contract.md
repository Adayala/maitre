# Contrato API — SPEC-144 Invoices

Crear, listar y obtener comprobantes, y ejecutar validate/issue/reconcile/credit mediante
comandos explícitos. Create e issue requieren Idempotency-Key; If-Match protege el draft y la
emisión congela el snapshot. Un timeout fiscal retorna estado pendiente, no un falso error
reintentable. Tests cubren concurrencia, duplicados, rechazo ARCA, notas asociadas, PII,
RBAC, auditoría y aislamiento entre tenants.
