# Contrato — SPEC-044 AuditLog

Registro append-only de acciones sensibles: id, occurredAt, tenantId, actor type/id,
action, resource type/id, `previousState?`, `newState?` y `correlationId?`.

No guarda tokens, passwords, secretos ni PII completa innecesaria. Eventos no se actualizan
ni borran mediante API común; retención/export/borrado obedecen SPEC-219/220 y obligaciones
legales. El I0 actual no implementa hash chain, request/causation IDs, actor platform/service ni
metadata técnica adicional. Escritura no debe permitir que un actor falsifique identidad. Tests
cubren append simple, omisión de `actorId` para `SYSTEM`, orden descendente y tenant isolation.
