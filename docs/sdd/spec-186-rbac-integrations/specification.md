# Especificación — SPEC-186 Integrations RBAC

Permisos: `integration.read/configure/activate/disable`, `oauth.authorize/revoke`,
`credential.rotate`, `sync.run/retry`, `webhook.outbound.manage`, `webhook.inbound.manage`,
`integration.test`, `integration.audit.read`.

`operator`, `integration admin` y `tenant admin` no son roles locales; roles canónicos reciben
assignments. Secrets no son legibles por ningún permiso. OAuth/rotation/outbound endpoint changes
requieren step-up y, según policy, segregación. Revocation pausa sesiones/jobs activas.

El dominio sigue deny-by-default y scope por tenant/integration cuando corresponda. Un actor puede
leer estado y auditoría sin poder activar, revocar o correr syncs. Del mismo modo, quien opera tests
o webhooks no obtiene por eso acceso a credenciales secretas ni a rotaciones OAuth.

La segregación de funciones puede exigir doble control para activación, rotación o cambio de endpoint
saliente, según policy del tenant o del ambiente. Las rutas y logs operativos deben respetar la misma
matriz de permisos que las APIs primarias.
