# Contrato — SPEC-044 AuditLog

Registro append-only de acciones sensibles: id, occurredAt, tenantId, actor type/id,
action, resource type/id, outcome, reason code, correlation/request/causation IDs, before/after
sanitizados y metadata técnica permitida.

No guarda tokens, passwords, secretos ni PII completa innecesaria. Eventos no se actualizan
ni borran mediante API común; retención/export/borrado obedecen SPEC-219/220 y obligaciones
legales. Escritura no debe permitir que un actor falsifique identidad. Tests cubren
inmutabilidad, redacción, orden/cursor, clock, tenant isolation y falla observable.
