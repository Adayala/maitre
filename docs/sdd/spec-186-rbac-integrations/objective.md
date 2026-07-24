# Objetivo — SPEC-186

Definir el RBAC del dominio integrations con separación entre configuración, OAuth, sync, webhooks,
tests y auditoría, siempre deny-by-default.

## Criterios de aceptación

### CAD-186-01 — Permisos quedan separados por lectura/configuración/OAuth/sync/webhooks/tests/auditoría

permisos quedan separados entre `integration.read/configure/activate/disable`,
`oauth.authorize/revoke`, `credential.rotate`, `sync.run/retry`,
`webhook.outbound.manage`, `webhook.inbound.manage`, `integration.test` e
`integration.audit.read`.

### CAD-186-02 — No hay roles locales implícitos; todo pasa por assignments canónicos

`operator`, `integration admin` y `tenant admin` no son roles locales implícitos; se
expresan mediante assignments sobre roles canónicos.

### CAD-186-03 — Ningún permiso del dominio lee secretos directamente

secrets no son legibles por ningún permiso directo del dominio.

### CAD-186-04 — OAuth, rotation y endpoint changes requieren step-up y segregación

OAuth, rotation y cambios de outbound endpoint requieren step-up y, según policy,
segregación de funciones.

### CAD-186-05 — Revocation pausa jobs/sesiones y admins operativos no heredan secretos

revocation puede pausar sesiones/jobs activos y admins de webhooks/tests no heredan
lectura de secretos.

### CAD-186-06 — La aprobación exige evidencia de deny-by-default, step-up y scopes

La aprobación exige fixtures de deny-by-default, step-up, segregación, no-lectura de
secretos y scopes por integración/tenant.
