# Contrato API — SPEC-045

`GET /v1/audit-logs` consulta por cursor, rango temporal acotado, `actor_id` y `resource_type`.
Orden descendente estable `occurredAt,id`; la respuesta devuelve los registros append-only tal como
están almacenados en el I0 simple (`actorType`, `actorId`, `action`, `resourceType`,
`resourceId`, `occurredAt`, `correlationId?`). No expone create/update/delete.

Acceso requiere permiso sensible y alcance de tenant; soporte cross-tenant usa rol de plataforma
separado y queda auditado. El I0 actual limita `limit` a 500 y no implementa export. Tests cubren
orden descendente, filtro por actor, autorización y lista vacía.
