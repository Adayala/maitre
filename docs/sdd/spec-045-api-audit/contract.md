# Contrato API — SPEC-045

`GET /v1/audit-logs` consulta por cursor, rango temporal acotado, actor, action y resource.
Orden descendente estable `occurredAt,id`; respuesta minimiza before/after según permiso.
No expone create/update/delete.

Acceso requiere permiso sensible y alcance de tenant; soporte cross-tenant usa rol de plataforma
separado y queda auditado. Filtros costosos tienen límites; exports son jobs/spec futura.
Tests cubren paginación sin gaps, redacción, retención, autorización y no enumeración.
